import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Allowed price IDs - whitelist of valid Stripe price IDs
const ALLOWED_PRICE_IDS = [
  'price_1St3Eg52lqSgjCze5l6pqANG', // starter
  'price_1St3FA52lqSgjCzeE8lXHzKH', // pro
];

// Validate that a URL belongs to allowed origins
const validateRedirectUrl = (url: string, allowedOrigins: string[]): boolean => {
  try {
    const parsed = new URL(url);
    return allowedOrigins.some(origin => parsed.origin === origin);
  } catch {
    return false;
  }
};

// Sanitize error messages - never expose internal details to clients
const getSanitizedErrorMessage = (error: Error | string): string => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Log the actual error server-side for debugging
  logStep("Internal error occurred", { actualError: errorMessage });
  
  // Return generic messages based on error type
  if (errorMessage.includes("STRIPE_SECRET_KEY") || errorMessage.includes("not set")) {
    return "Service temporarily unavailable";
  }
  if (errorMessage.includes("Authentication") || errorMessage.includes("authorization") || errorMessage.includes("authenticated")) {
    return "Unable to verify authentication";
  }
  if (errorMessage.includes("Stripe") || errorMessage.includes("customer") || errorMessage.includes("checkout")) {
    return "Payment service temporarily unavailable";
  }
  if (errorMessage.includes("priceId") || errorMessage.includes("required")) {
    return "Invalid request parameters";
  }
  
  return "An unexpected error occurred";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { priceId, referralCode } = await req.json();
    
    // Validate priceId is required
    if (!priceId) throw new Error("priceId is required");
    
    // Validate priceId against whitelist of allowed price IDs
    if (!ALLOWED_PRICE_IDS.includes(priceId)) {
      logStep("Invalid priceId attempted", { priceId });
      throw new Error("Invalid price ID");
    }
    logStep("Request body parsed and validated", { priceId, referralCode: referralCode || "none" });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No existing customer, will create new");
    }

    // Use server-side origin for redirect URLs - never trust client-supplied URLs
    const origin = req.headers.get("origin") || "https://fintu-hausmeister-app.lovable.app";
    
    // Build allowed origins list for validation
    const allowedOrigins = [
      "https://fintu-hausmeister-app.lovable.app",
      "https://ft-hausmeister-pro.lovable.app",
      "https://id-preview--c4163110-c9ea-4e01-9f68-8b0f13fbdce9.lovable.app",
      "http://localhost:3000",
      "http://localhost:8080",
    ];
    
    // Only use origin if it's in our allowed list, otherwise use production URL
    const safeOrigin = allowedOrigins.includes(origin) 
      ? origin 
      : "https://ft-hausmeister-pro.lovable.app";
    
    logStep("Using safe origin for redirects", { origin, safeOrigin });

    // Look up Stripe promotion code from referral code
    let discounts: { promotion_code: string }[] | undefined;
    if (referralCode) {
      try {
        const supabaseAdmin = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
          { auth: { persistSession: false } }
        );
        
        const { data: codeData } = await supabaseAdmin
          .from("referral_codes")
          .select("stripe_promotion_code_id, id, app_id")
          .eq("code", referralCode)
          .eq("is_active", true)
          .maybeSingle();
        
        if (codeData?.stripe_promotion_code_id) {
          discounts = [{ promotion_code: codeData.stripe_promotion_code_id }];
          logStep("Referral discount applied", { 
            promoId: codeData.stripe_promotion_code_id, 
            referralCode 
          });
          
          // Track conversion as "signed_up"
          await supabaseAdmin.from("referral_conversions").insert({
            referral_code_id: codeData.id,
            app_id: codeData.app_id,
            referred_user_id: user.id,
            referred_email: user.email,
            status: "signed_up",
          });
        } else {
          logStep("Referral code not found or no promo ID", { referralCode });
        }
      } catch (e) {
        logStep("Referral lookup failed (non-fatal)", { error: String(e) });
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      ...(discounts ? { discounts } : {}),
      success_url: `${safeOrigin}/success`,
      cancel_url: `${safeOrigin}/pricing`,
      metadata: {
        user_id: user.id,
        referral_code: referralCode || "",
      },
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const sanitizedMessage = getSanitizedErrorMessage(error instanceof Error ? error : String(error));
    return new Response(JSON.stringify({ error: sanitizedMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

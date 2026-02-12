import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// Stripe import kept for future coupon integration
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[REFERRAL] ${step}${d}`);
};

function generateCode(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  for (const b of arr) code += chars[b % chars.length];
  return code;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const { action, app_id, referral_code } = await req.json();
    logStep("Action", { action, app_id, referral_code });

    // --- Generate or get referral code for authenticated user ---
    if (action === "get_or_create_code") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) throw new Error("Not authenticated");
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
      if (userError || !userData.user) throw new Error("Auth failed");
      const userId = userData.user.id;
      const targetAppId = app_id || "hausmeisterpro";

      // Check existing
      const { data: existing } = await supabaseAdmin
        .from("referral_codes")
        .select("*")
        .eq("user_id", userId)
        .eq("app_id", targetAppId)
        .maybeSingle();

      if (existing) {
        logStep("Existing code found", { code: existing.code });
        return new Response(JSON.stringify({ code: existing }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Generate unique code
      let code = generateCode();
      let attempts = 0;
      while (attempts < 5) {
        const { data: clash } = await supabaseAdmin
          .from("referral_codes")
          .select("id")
          .eq("code", code)
          .maybeSingle();
        if (!clash) break;
        code = generateCode();
        attempts++;
      }

      // Stripe coupon creation – coming later
      const stripeCouponId: string | null = null;
      const stripePromoId: string | null = null;

      // Insert into DB
      const { data: newCode, error: insertError } = await supabaseAdmin
        .from("referral_codes")
        .insert({
          user_id: userId,
          app_id: targetAppId,
          code,
          stripe_coupon_id: stripeCouponId,
          stripe_promotion_code_id: stripePromoId,
          discount_percent: 20,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      logStep("New code created", { code });
      return new Response(JSON.stringify({ code: newCode }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Track a referral click/conversion ---
    if (action === "track_click") {
      if (!referral_code) throw new Error("referral_code required");

      const { data: codeData } = await supabaseAdmin
        .from("referral_codes")
        .select("*")
        .eq("code", referral_code)
        .eq("is_active", true)
        .maybeSingle();

      if (!codeData) {
        return new Response(JSON.stringify({ valid: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Insert conversion tracking
      const { error: convError } = await supabaseAdmin
        .from("referral_conversions")
        .insert({
          referral_code_id: codeData.id,
          app_id: codeData.app_id,
          status: "clicked",
        });

      if (convError) logStep("Conversion insert error", convError);

      return new Response(
        JSON.stringify({
          valid: true,
          app_id: codeData.app_id,
          discount_percent: codeData.discount_percent,
          stripe_coupon_id: codeData.stripe_coupon_id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Get referral stats for authenticated user ---
    if (action === "get_stats") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) throw new Error("Not authenticated");
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
      if (userError || !userData.user) throw new Error("Auth failed");
      const userId = userData.user.id;

      const { data: codes } = await supabaseAdmin
        .from("referral_codes")
        .select("*")
        .eq("user_id", userId);

      const codeIds = (codes || []).map((c: { id: string }) => c.id);
      let conversions: unknown[] = [];
      if (codeIds.length > 0) {
        const { data: convData } = await supabaseAdmin
          .from("referral_conversions")
          .select("*")
          .in("referral_code_id", codeIds);
        conversions = convData || [];
      }

      const totalClicks = conversions.length;
      const totalConverted = conversions.filter(
        (c: any) => c.status === "converted"
      ).length;
      const totalSaved = conversions.reduce(
        (sum: number, c: any) => sum + (Number(c.amount_saved) || 0),
        0
      );

      return new Response(
        JSON.stringify({
          codes: codes || [],
          stats: {
            total_clicks: totalClicks,
            total_converted: totalConverted,
            total_saved: totalSaved,
          },
          conversions,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // List all coupons
    const coupons = await stripe.coupons.list({ limit: 100 });

    // List all promotion codes
    const promoCodes = await stripe.promotionCodes.list({ limit: 100 });

    return new Response(
      JSON.stringify({
        coupons_count: coupons.data.length,
        coupons: coupons.data.map((c) => ({
          id: c.id,
          name: c.name,
          percent_off: c.percent_off,
          amount_off: c.amount_off,
          currency: c.currency,
          duration: c.duration,
          valid: c.valid,
          times_redeemed: c.times_redeemed,
          created: new Date(c.created * 1000).toISOString(),
        })),
        promo_codes_count: promoCodes.data.length,
        promo_codes: promoCodes.data.map((p) => ({
          id: p.id,
          code: p.code,
          coupon_id: p.coupon.id,
          active: p.active,
          times_redeemed: p.times_redeemed,
          max_redemptions: p.max_redemptions,
          created: new Date(p.created * 1000).toISOString(),
        })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

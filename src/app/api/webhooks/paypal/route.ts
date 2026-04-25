import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addCredits } from "@/lib/credits/service";

const PAYPAL_API_URL = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

export async function POST(req: Request) {
  const body = await req.json();
  const headers = req.headers;

  // 1. Verify Webhook Signature
  const isVerified = await verifyPayPalSignature(req, body);
  if (!isVerified) {
    console.error("PayPal Webhook Verification Failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const eventType = body.event_type;
  console.log(`Processing PayPal event: ${eventType}`);

  // 2. Handle relevant events
  if (
    eventType === 'CHECKOUT.ORDER.APPROVED' || 
    eventType === 'PAYMENT.CAPTURE.COMPLETED' ||
    eventType === 'BILLING.SUBSCRIPTION.CREATED' ||
    eventType === 'BILLING.SUBSCRIPTION.ACTIVATED'
  ) {
    const resource = body.resource;
    
    const rawCustomId = resource.custom_id || resource.purchase_units?.[0]?.custom_id;
    const amount = Number(resource.amount?.value || resource.purchase_units?.[0]?.amount?.value || 0);

    const supabase = await createClient();

    // Handle "pro_subscription:USER_ID" format
    if (rawCustomId?.startsWith('pro_subscription:')) {
      const userId = rawCustomId.replace('pro_subscription:', '');
      await supabase.from('profiles').update({ is_pro: true, tier: 'pro' }).eq('id', userId);
      return NextResponse.json({ success: true, isPro: true });
    }

    // Handle "pro_upgrade:USER_ID" format for Pro tier (Legacy/One-time)
    if (rawCustomId.startsWith('pro_upgrade:')) {
      const userId = rawCustomId.replace('pro_upgrade:', '');
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          is_pro: true,
          tier: 'pro'
        })
        .eq('id', userId);

      if (updateError) {
        console.error("Error upgrading user to Pro:", updateError);
        return NextResponse.json({ error: "Failed to upgrade profile" }, { status: 500 });
      }

      return NextResponse.json({ success: true, isPro: true });
    }

    // Handle "credits:USER_ID" format for credit purchases
    if (rawCustomId.startsWith('credits:')) {
      const userId = rawCustomId.replace('credits:', '');
      
      const creditAmount = amount * 20; // $1 = 20 credits
      const result = await addCredits(userId, creditAmount, `PayPal Purchase: $${amount}`);
      
      if (!result.success) {
        return NextResponse.json({ error: "Failed to add credits" }, { status: 500 });
      }

      return NextResponse.json({ success: true, creditsAdded: creditAmount });
    }

    // Handle Legacy/Donation "USER_ID" format
    const userId = rawCustomId;
    
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('donation_total')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error("Error fetching profile:", fetchError);
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const newDonationTotal = Number(profile.donation_total) + amount;
    
    // Logic: If total donation > $10, upgrade to 'elite'. If > $1, upgrade to 'pro'.
    let newTier = 'community';
    if (newDonationTotal >= 10) newTier = 'elite';
    else if (newDonationTotal > 0) newTier = 'pro';

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        tier: newTier, 
        donation_total: newDonationTotal 
      })
      .eq('id', userId);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, tier: newTier });
  }

  // Handle Cancellation
  if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED' || eventType === 'BILLING.SUBSCRIPTION.EXPIRED') {
    const resource = body.resource;
    const rawCustomId = resource.custom_id;
    if (rawCustomId?.startsWith('pro_subscription:')) {
      const userId = rawCustomId.replace('pro_subscription:', '');
      const supabase = await createClient();
      await supabase.from('profiles').update({ is_pro: false, tier: 'community' }).eq('id', userId);
    }
  }

  return NextResponse.json({ received: true });
}

async function verifyPayPalSignature(req: Request, body: any) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.warn("PAYPAL_WEBHOOK_ID not set. Skipping verification (DEV ONLY)");
    return process.env.NODE_ENV === 'development';
  }

  try {
    // Get access token for verification request
    const auth = Buffer.from(`${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
    const tokenRes = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    });
    const { access_token } = await tokenRes.json();

    // Verify signature with PayPal
    const verifyRes = await fetch(`${PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transmission_id: req.headers.get('paypal-transmission-id'),
        transmission_time: req.headers.get('paypal-transmission-time'),
        cert_url: req.headers.get('paypal-cert-url'),
        auth_algo: req.headers.get('paypal-auth-algo'),
        transmission_sig: req.headers.get('paypal-transmission-sig'),
        webhook_id: webhookId,
        webhook_event: body
      })
    });

    const verification = await verifyRes.json();
    return verification.verification_status === 'SUCCESS';
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: "shop_approved" | "shop_rejected" | "new_rating";
  to: string;
  shopName: string;
  ratingDetails?: {
    isHelpful: boolean;
    isHonest: boolean;
    isRespectful: boolean;
    isCalm: boolean;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.log("RESEND_API_KEY not configured, skipping email");
      return new Response(
        JSON.stringify({ success: false, message: "Email service not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { type, to, shopName, ratingDetails }: EmailRequest = await req.json();

    let subject: string;
    let html: string;

    switch (type) {
      case "shop_approved":
        subject = `🎉 Your shop "${shopName}" has been approved!`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #22c55e;">Congratulations! 🎉</h1>
            <p>Great news! Your shop <strong>${shopName}</strong> has been approved and is now live on our platform.</p>
            <p>Customers can now discover your shop and connect with you.</p>
            <h3>Next Steps:</h3>
            <ul>
              <li>Complete your profile with photos and story</li>
              <li>Add your products to showcase your offerings</li>
              <li>Share your shop link with customers</li>
            </ul>
            <p>Thank you for being part of our community!</p>
          </div>
        `;
        break;

      case "shop_rejected":
        subject = `Update on your shop "${shopName}" application`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ef4444;">Application Update</h1>
            <p>We've reviewed your shop <strong>${shopName}</strong> application.</p>
            <p>Unfortunately, we couldn't approve your shop at this time. This could be due to:</p>
            <ul>
              <li>Incomplete business information</li>
              <li>Missing required details</li>
              <li>Policy compliance issues</li>
            </ul>
            <p>Please review your shop details and resubmit for approval.</p>
          </div>
        `;
        break;

      case "new_rating":
        const positiveTraits = [];
        if (ratingDetails?.isHelpful) positiveTraits.push("Helpful");
        if (ratingDetails?.isHonest) positiveTraits.push("Honest");
        if (ratingDetails?.isRespectful) positiveTraits.push("Respectful");
        if (ratingDetails?.isCalm) positiveTraits.push("Calm");

        subject = `⭐ New rating for "${shopName}"`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #3b82f6;">New Customer Rating! ⭐</h1>
            <p>Your shop <strong>${shopName}</strong> just received a new rating!</p>
            ${positiveTraits.length > 0 ? `
              <h3>Positive Feedback:</h3>
              <ul>
                ${positiveTraits.map(trait => `<li style="color: #22c55e;">✓ ${trait}</li>`).join('')}
              </ul>
            ` : '<p>Keep up the good work to earn more positive ratings!</p>'}
            <p>Continue providing great service to build your reputation!</p>
          </div>
        `;
        break;

      default:
        throw new Error("Invalid email type");
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "notifications@resend.dev",
        to: [to],
        subject,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to send email");
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

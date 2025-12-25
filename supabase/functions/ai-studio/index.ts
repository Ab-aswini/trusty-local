import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, bulletPoints, shopId } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Image is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check AI usage limit for the shop
    if (shopId) {
      const { data: shop, error: shopError } = await supabase
        .from("shops")
        .select("ai_usage_count, ai_usage_reset_at")
        .eq("id", shopId)
        .single();

      if (shopError) {
        console.error("Error fetching shop:", shopError);
      } else if (shop) {
        const now = new Date();
        const resetAt = shop.ai_usage_reset_at ? new Date(shop.ai_usage_reset_at) : null;
        
        // Reset counter if it's a new day
        if (!resetAt || now.toDateString() !== resetAt.toDateString()) {
          await supabase
            .from("shops")
            .update({ ai_usage_count: 0, ai_usage_reset_at: now.toISOString() })
            .eq("id", shopId);
        } else if (shop.ai_usage_count >= 10) {
          return new Response(
            JSON.stringify({ error: "Daily AI usage limit reached (10/day)" }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    console.log("Processing AI Studio request for shop:", shopId);

    // Build the prompt for description generation
    let descriptionPrompt = `You are a helpful assistant for small business owners. 
Analyze this product image and generate a clear, factual, neutral product description.

Guidelines:
- Be factual and descriptive, not promotional
- Focus on what is visible in the image
- Keep descriptions under 100 words
- Use simple, accessible language
- Do not make claims about quality or value`;

    if (bulletPoints) {
      descriptionPrompt += `\n\nThe vendor provided these details about the product:\n${bulletPoints}\n\nIncorporate these facts naturally into the description.`;
    }

    // Generate product description using Gemini
    const descriptionResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: descriptionPrompt },
              {
                type: "image_url",
                image_url: { url: imageBase64 },
              },
            ],
          },
        ],
      }),
    });

    if (!descriptionResponse.ok) {
      const errorText = await descriptionResponse.text();
      console.error("AI description error:", descriptionResponse.status, errorText);
      
      if (descriptionResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI service rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (descriptionResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service quota exceeded. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("Failed to generate description");
    }

    const descriptionData = await descriptionResponse.json();
    const generatedDescription = descriptionData.choices?.[0]?.message?.content || "";

    console.log("Generated description:", generatedDescription.substring(0, 100) + "...");

    // Try to enhance the image using image generation model
    let enhancedImage = null;
    
    try {
      const imageEnhanceResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Enhance this product photo to look more professional with a clean white background while keeping the product exactly as it is. Make it suitable for an e-commerce listing.",
                },
                {
                  type: "image_url",
                  image_url: { url: imageBase64 },
                },
              ],
            },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (imageEnhanceResponse.ok) {
        const imageData = await imageEnhanceResponse.json();
        enhancedImage = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;
        console.log("Image enhancement successful");
      } else {
        console.log("Image enhancement not available, using original");
      }
    } catch (imageError) {
      console.log("Image enhancement failed, using original:", imageError);
    }

    // Update AI usage count
    if (shopId) {
      const { data: currentShop } = await supabase
        .from("shops")
        .select("ai_usage_count")
        .eq("id", shopId)
        .single();
      
      if (currentShop) {
        await supabase
          .from("shops")
          .update({ ai_usage_count: (currentShop.ai_usage_count || 0) + 1 })
          .eq("id", shopId);
      }
    }

    return new Response(
      JSON.stringify({
        description: generatedDescription,
        enhancedImage: enhancedImage,
        success: true,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI Studio error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

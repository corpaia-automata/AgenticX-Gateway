import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import QRCode from "https://esm.sh/qrcode@1.5.3";

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
    const { referralCode, userId } = await req.json();

    if (!referralCode || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing referralCode or userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate QR code URL
    const referralUrl = `${req.headers.get("origin") || "https://lovable.app"}/register?ref=${referralCode}`;

    // Generate QR code as SVG string (works in Deno)
    const qrCodeSvg = await QRCode.toString(referralUrl, {
      errorCorrectionLevel: "M",
      type: "svg",
      width: 400,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    // Convert SVG to data URL
    const qrCodeDataUrl = `data:image/svg+xml;base64,${btoa(qrCodeSvg)}`;

    // Update user profile with QR code URL
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ qr_code_url: qrCodeDataUrl })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ qrCodeUrl: qrCodeDataUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error generating QR code:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

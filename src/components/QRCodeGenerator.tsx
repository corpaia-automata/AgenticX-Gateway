import { useState } from "react";
import { nanoid } from "nanoid";
import QRCode from "qrcode";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";

interface QRCodeGeneratorProps {
  targetUrl?: string;
  onGenerated?: (code: string, qrDataUrl: string) => void;
}

export const QRCodeGenerator = ({ 
  targetUrl, 
  onGenerated 
}: QRCodeGeneratorProps) => {
  const [loading, setLoading] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateQRCode = async () => {
    setLoading(true);
    setError(null);
    setQrCodeDataUrl(null);
    setQrCode(null);

    try {
      // Generate unique short ID
      const uniqueCode = nanoid(8); // 8 characters should be sufficient
      
      // Determine target URL - use provided URL or default to registration page
      const baseUrl = window.location.origin;
      const finalTargetUrl = targetUrl || `${baseUrl}/register?ref=${uniqueCode}`;

      // Step 1: Store QR metadata in Supabase
      const { data: insertedData, error: insertError } = await supabase
        .from("qr_codes")
        .insert({
          code: uniqueCode,
          target_url: finalTargetUrl,
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to store QR code: ${insertError.message}`);
      }

      console.log("✅ QR code metadata stored:", insertedData);

      // Step 2: Generate QR image (client-side)
      const qrDataUrl = await QRCode.toDataURL(finalTargetUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      setQrCodeDataUrl(qrDataUrl);
      setQrCode(uniqueCode);

      // Callback if provided
      if (onGenerated) {
        onGenerated(uniqueCode, qrDataUrl);
      }

      toast.success("QR code generated successfully!");
    } catch (err: any) {
      console.error("❌ QR code generation error:", err);
      setError(err.message || "Failed to generate QR code");
      toast.error(err.message || "Failed to generate QR code");
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;

    try {
      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = qrCodeDataUrl;
      link.download = `qr-code-${qrCode || "download"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("QR code downloaded!");
    } catch (err: any) {
      console.error("❌ Download error:", err);
      toast.error("Failed to download QR code");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>QR Code Generator</CardTitle>
        <CardDescription>
          Generate a unique QR code that links to the registration page
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={generateQRCode}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating QR Code...
            </>
          ) : (
            "Generate QR Code"
          )}
        </Button>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {qrCodeDataUrl && (
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-2">
              <img
                src={qrCodeDataUrl}
                alt="QR Code"
                className="border border-border rounded-lg p-2 bg-white"
              />
              {qrCode && (
                <p className="text-sm text-muted-foreground">
                  Code: <span className="font-mono font-semibold">{qrCode}</span>
                </p>
              )}
            </div>
            <Button
              onClick={downloadQRCode}
              variant="outline"
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download QR Code (PNG)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

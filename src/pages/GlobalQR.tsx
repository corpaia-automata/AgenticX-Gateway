import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, Share2, Download, QrCode, ArrowLeft, Loader2 } from "lucide-react";
import QRCode from "qrcode";

const GlobalQR = () => {
  const navigate = useNavigate();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateGlobalQR();
  }, []);

  const generateGlobalQR = async () => {
    try {
      setLoading(true);
      // Generate QR code for global registration (no referral code)
      const registrationUrl = `${window.location.origin}/register`;
      
      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(registrationUrl, {
        errorCorrectionLevel: "M",
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Failed to generate QR code");
    } finally {
      setLoading(false);
    }
  };

  const registrationLink = `${window.location.origin}/register`;

  const copyLink = () => {
    navigator.clipboard.writeText(registrationLink);
    toast.success("Registration link copied!");
  };

  const shareWhatsApp = () => {
    const text = `Join our exclusive AI-Driven Business Community! Scan the QR code or use this link: ${registrationLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  const downloadQR = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.download = "global-community-qr-code.png";
    link.href = qrCodeUrl;
    link.click();
    toast.success("QR code downloaded!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-premium">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-premium p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate("/")} variant="secondary" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Global Community QR Code</h1>
            <p className="text-muted-foreground">Share this QR code to invite people to join the community</p>
          </div>
        </div>

        {/* Main Card */}
        <Card className="border-border bg-card shadow-premium">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <QrCode className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Community Registration QR Code</CardTitle>
            <CardDescription>
              Anyone can scan this QR code to join the Black Card Community
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR Code Display */}
            <div className="flex justify-center">
              <div className="bg-white p-6 rounded-lg border-4 border-primary shadow-lg">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Global Community QR Code" className="w-64 h-64" />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
              </div>
            </div>

            {/* Registration Link */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Registration Link
              </label>
              <div className="flex gap-2">
                <input
                  value={registrationLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-secondary border border-border rounded-md font-mono text-sm"
                />
                <Button onClick={copyLink} size="icon" variant="secondary">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid md:grid-cols-3 gap-3">
              <Button onClick={downloadQR} variant="secondary" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download QR
              </Button>
              <Button onClick={shareWhatsApp} className="w-full bg-[#25D366] hover:bg-[#20BA5A]">
                <Share2 className="mr-2 h-4 w-4" />
                Share WhatsApp
              </Button>
              <Button onClick={copyLink} variant="outline" className="w-full">
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
            </div>

            {/* Info Section */}
            <div className="bg-secondary/50 p-4 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">How to Use</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Print or display this QR code at events, community centers, or public spaces</li>
                <li>• Share the QR code image via social media or messaging apps</li>
                <li>• Anyone who scans it will be taken to the registration page</li>
                <li>• New members can then create their own referral codes to invite others</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GlobalQR;


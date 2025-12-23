import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle, Copy, Share2, QrCode, Loader2 } from "lucide-react";

const Success = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // If no session, user might need to confirm email first
    // Still show success page but with a message to check email
    if (!session) {
      console.log("No session found - user may need to confirm email");
      setLoading(false);
      return;
    }

    // Fetch user profile
    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (error || !profileData) {
      console.error("Failed to load profile:", error);
      // Don't redirect - show success page anyway
      setLoading(false);
      return;
    }

    setProfile(profileData);

    // Generate QR code only if:
    // 1. Profile has a referral_code (required for QR generation)
    // 2. QR code URL doesn't exist yet
    if (profileData.referral_code && !profileData.qr_code_url) {
      console.log("Generating QR code for referral code:", profileData.referral_code);
      await generateQRCode(profileData.referral_code, session.user.id);
    } else if (profileData.qr_code_url) {
      // QR code already exists, use it
      setQrCodeUrl(profileData.qr_code_url);
    } else {
      console.warn("Cannot generate QR code: referral_code missing from profile");
    }

    setLoading(false);
  };

  const generateQRCode = async (referralCode: string, userId: string) => {
    try {
      // Ensure referral code exists before generating QR
      if (!referralCode || !referralCode.trim()) {
        console.error("Cannot generate QR code: referral code is empty");
        return;
      }

      console.log("Calling generate-qr function with:", { referralCode, userId });
      const { data, error } = await supabase.functions.invoke("generate-qr", {
        body: { referralCode, userId },
      });

      if (error) {
        console.error("QR generation function error:", error);
        throw error;
      }

      if (data?.qrCodeUrl) {
        setQrCodeUrl(data.qrCodeUrl);
        console.log("QR code generated successfully");
      } else {
        console.warn("QR generation returned no URL:", data);
      }
    } catch (error: any) {
      console.error("Error generating QR code:", error);
      // Don't show error toast - QR is optional, registration succeeded
      // Just log for debugging
    }
  };

  const referralLink = profile
    ? `${window.location.origin}/register?ref=${profile.referral_code}`
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  const shareWhatsApp = () => {
    const text = `Join our community! Use my referral link: ${referralLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-premium">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-premium p-4">
      <Card className="w-full max-w-2xl border-border bg-card shadow-premium">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-2">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">
            Welcome to the Community!
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Your account has been created successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-secondary/50 p-6 rounded-lg border border-border space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Your Next Steps</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Share your unique referral link or QR code with friends</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Refer 5 people to unlock your exclusive Black Community Card</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Track your referrals in your dashboard</span>
              </li>
            </ul>
          </div>

          {!profile ? (
            <div className="bg-primary/10 border border-primary/20 p-6 rounded-lg text-center space-y-4">
              <p className="text-primary font-medium">
                Please check your email to confirm your account.
              </p>
              <p className="text-sm text-muted-foreground">
                Once you confirm your email, you'll be able to access your referral link and dashboard.
              </p>
              <Button onClick={() => navigate("/login")} variant="secondary">
                Go to Login
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">
                    Your Referral Link
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={referralLink}
                      readOnly
                      className="bg-secondary border-border font-mono text-sm"
                    />
                    <Button onClick={copyLink} size="icon" variant="secondary">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {qrCodeUrl && (
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg border-4 border-primary">
                      <img 
                        src={qrCodeUrl} 
                        alt="QR Code" 
                        className="w-48 h-48"
                        crossOrigin="anonymous"
                        loading="lazy"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={shareWhatsApp} className="flex-1 bg-[#25D366] hover:bg-[#20BA5A]">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share via WhatsApp
                  </Button>
                  <Button onClick={copyLink} variant="secondary" className="flex-1">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                  </Button>
                </div>
              </div>

              <Button onClick={() => navigate("/dashboard")} className="w-full bg-gradient-primary">
                Go to Dashboard
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <label className={className}>{children}</label>;
};

export default Success;

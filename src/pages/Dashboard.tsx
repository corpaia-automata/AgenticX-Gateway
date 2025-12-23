import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Copy, LogOut, QrCode, Users, Loader2, Lock, Unlock, Download, Gift } from "lucide-react";
import CommunityCard from "@/components/CommunityCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [qrLoading, setQrLoading] = useState(false);
  const qrGeneratedRef = useRef(false);

  useEffect(() => {
    loadDashboardData();

    // Set up real-time subscriptions for profile updates and new referrals
    let profileChannel: any = null;
    let referralsChannel: any = null;

    const setupRealtime = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // Subscribe to profile updates (for referral_count changes)
        profileChannel = supabase
          .channel("profile-changes")
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "profiles",
              filter: `id=eq.${session.user.id}`,
            },
            (payload) => {
              // Update profile when referral_count changes
              // This automatically triggers UI update and unlocks card when count >= 5
              if (payload.new) {
                setProfile(payload.new as any);
              }
            }
          )
          .subscribe();

        // Subscribe to new referrals (when someone uses your referral code)
        referralsChannel = supabase
          .channel("referrals-changes")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "profiles",
              filter: `referred_by=eq.${session.user.id}`,
            },
            async () => {
              // Reload referrals list when a new referral is added
              const { data: referralData, error: referralError } = await supabase
                .from("profiles")
                .select("*")
                .eq("referred_by", session.user.id)
                .order("created_at", { ascending: false });

              if (!referralError && referralData) {
                setReferrals(referralData);
                console.log("Referrals list updated:", referralData.length);
              }
            }
          )
          .subscribe();
      }
    };

    setupRealtime();

    return () => {
      if (profileChannel) {
        supabase.removeChannel(profileChannel);
      }
      if (referralsChannel) {
        supabase.removeChannel(referralsChannel);
      }
    };
  }, []);

  const loadDashboardData = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      // This shouldn't happen due to ProtectedRoute, but handle gracefully
      setLoading(false);
      return;
    }

    // Fetch user profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (profileError || !profileData) {
      toast.error("Failed to load profile");
      setLoading(false);
      return;
    }

    setProfile(profileData);

    // Fetch referrals
    const { data: referralData, error: referralError } = await supabase
      .from("profiles")
      .select("*")
      .eq("referred_by", session.user.id)
      .order("created_at", { ascending: false });

    if (referralError) {
      console.error("Error fetching referrals:", referralError);
      toast.error("Failed to load referrals");
    } else {
      console.log("Referrals loaded:", referralData?.length || 0);
      setReferrals(referralData || []);
    }

    // Generate QR code only if profile has referral_code and hasn't been generated yet
    if (profileData.referral_code && !qrGeneratedRef.current) {
      // Check if QR code already exists in profile
      if (profileData.qr_code_url) {
        setQrCodeUrl(profileData.qr_code_url);
        qrGeneratedRef.current = true;
      } else {
        // Generate QR code for referral URL (only once)
        qrGeneratedRef.current = true;
        await generateQRCode(profileData.referral_code, session.user.id);
      }
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

      setQrLoading(true);
      console.log("Generating QR code for referral code:", referralCode);

      // Use the referral URL format: https://gatewaypass.agenticx.world/register?ref=CODE
      const referralUrl = `https://gatewaypass.agenticx.world/register?ref=${referralCode}`;

      // Try Supabase function first (if available)
      try {
        const { data, error } = await supabase.functions.invoke("generate-qr", {
          body: { referralCode, userId },
        });

        if (!error && data?.qrCodeUrl) {
          setQrCodeUrl(data.qrCodeUrl);
          console.log("QR code generated successfully via Supabase function");
          return;
        }
      } catch (functionError) {
        console.log("Supabase function not available or failed, using client-side generation");
      }

      // Fallback to client-side generation using qrcode library
      const QRCode = (await import("qrcode")).default;
      
      const qrDataUrl = await QRCode.toDataURL(referralUrl, {
        errorCorrectionLevel: "M",
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      setQrCodeUrl(qrDataUrl);
      console.log("QR code generated successfully client-side");
    } catch (error: any) {
      console.error("Error generating QR code:", error);
    } finally {
      setQrLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Use the referral URL format: https://gatewaypass.agenticx.world/register?ref=CODE
  const referralLink = profile?.referral_code
    ? `https://gatewaypass.agenticx.world/register?ref=${profile.referral_code}`
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

  const progress = profile ? Math.min((profile.referral_count / 5) * 100, 100) : 0;
  const hasUnlockedCard = profile && profile.referral_count >= 5;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-premium">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleDownloadCard = () => {
    // Create a canvas to capture the card
    const cardElement = document.getElementById("community-card");
    if (!cardElement) return;

    // For now, just show a toast - can be enhanced with actual download logic
    toast.success("Card download feature coming soon!");
  };

  return (
    <div className="min-h-screen bg-gradient-premium p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome, {profile?.name}!</h1>
            <p className="text-muted-foreground">Manage your referrals and track your progress</p>
          </div>
          <Button onClick={handleLogout} variant="secondary">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Rewards
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Referrals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{profile?.referral_count || 0}</div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Referral Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-mono font-bold text-primary">
                    {profile?.referral_code}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Card Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-semibold">
                    {hasUnlockedCard ? (
                      <span className="text-accent">Unlocked! ✨</span>
                    ) : (
                      <span className="text-muted-foreground">Locked</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Referral Tools */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Share Your Referral</CardTitle>
                <CardDescription>Invite friends and grow the community</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Your Referral Link</label>
                  <div className="flex gap-2">
                    <input
                      value={referralLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-secondary border border-border rounded-md font-mono text-sm"
                    />
                    <Button onClick={copyLink} size="icon" variant="secondary">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* QR Code Display */}
                {profile?.referral_code && (
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg border-4 border-primary">
                      {qrCodeUrl ? (
                        <img 
                          src={qrCodeUrl} 
                          alt="Referral QR Code" 
                          className="w-48 h-48"
                          crossOrigin="anonymous"
                          loading="lazy"
                        />
                      ) : qrLoading ? (
                        <div className="w-48 h-48 flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : (
                        <div className="w-48 h-48 flex items-center justify-center text-muted-foreground text-sm">
                          QR Code loading...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={shareWhatsApp} className="flex-1 bg-[#25D366] hover:bg-[#20BA5A]">
                    Share via WhatsApp
                  </Button>
                  <Button onClick={copyLink} variant="secondary" className="flex-1">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* My Referrals */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  My Referrals
                </CardTitle>
                <CardDescription>People who joined using your referral code</CardDescription>
              </CardHeader>
              <CardContent>
                {referrals.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <p className="text-muted-foreground">
                      No referrals yet
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Share your referral link to start earning referrals!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {referrals.map((referral) => (
                      <div
                        key={referral.id}
                        className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-foreground">{referral.name}</p>
                          {referral.email && (
                            <p className="text-sm text-muted-foreground">{referral.email}</p>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(referral.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Community Card Reward
                </CardTitle>
                <CardDescription>
                  Unlock your exclusive Black Community Card by referring 5 people
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Community Card Display */}
                <div className="flex justify-center">
                  <div
                    id="community-card"
                    className={`relative inline-block ${!hasUnlockedCard ? "blur-sm" : ""}`}
                  >
                    <CommunityCard 
                      name={profile?.name || ""} 
                      cardNumber={profile?.id || ""} 
                    />
                    {!hasUnlockedCard && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-lg backdrop-blur-sm z-10">
                        <Lock className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-white font-semibold text-lg mb-2">
                          Card Locked
                        </p>
                        <p className="text-white/80 text-sm text-center px-4">
                          Refer 5 people to unlock this card
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Section */}
                {!hasUnlockedCard ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-foreground">
                          Progress to Unlock
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {profile?.referral_count || 0} / 5 referrals
                        </span>
                      </div>
                      <Progress value={progress} className="h-3" />
                      <p className="text-sm text-muted-foreground mt-2 text-center">
                        {5 - (profile?.referral_count || 0)} more {5 - (profile?.referral_count || 0) === 1 ? "referral" : "referrals"} needed
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-accent">
                      <Unlock className="h-5 w-5" />
                      <span className="font-semibold">Card Unlocked! ✨</span>
                    </div>
                    <div className="flex justify-center gap-3">
                      <Button onClick={handleDownloadCard} className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download Card
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          const cardElement = document.getElementById("community-card");
                          if (cardElement) {
                            cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
                          }
                        }}
                      >
                        View Card
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;

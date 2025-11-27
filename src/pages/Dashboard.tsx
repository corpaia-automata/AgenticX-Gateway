import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Copy, LogOut, QrCode, Users, Loader2 } from "lucide-react";
import CommunityCard from "@/components/CommunityCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      navigate("/register");
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
      return;
    }

    setProfile(profileData);

    // Fetch referrals
    const { data: referralData, error: referralError } = await supabase
      .from("profiles")
      .select("*")
      .eq("referred_by", session.user.id)
      .order("created_at", { ascending: false });

    if (!referralError && referralData) {
      setReferrals(referralData);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
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

  const progress = profile ? Math.min((profile.referral_count / 5) * 100, 100) : 0;
  const hasUnlockedCard = profile && profile.referral_count >= 5;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-premium">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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

        {/* Progress */}
        {!hasUnlockedCard && (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Unlock Your Black Community Card</CardTitle>
              <CardDescription>
                Refer {5 - (profile?.referral_count || 0)} more {5 - (profile?.referral_count || 0) === 1 ? "person" : "people"} to unlock
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                {profile?.referral_count || 0} / 5 referrals
              </p>
            </CardContent>
          </Card>
        )}

        {/* Community Card */}
        {hasUnlockedCard && (
          <div className="flex justify-center">
            <CommunityCard name={profile.name} cardNumber={profile.id} />
          </div>
        )}

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

            {profile?.qr_code_url && (
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg border-4 border-primary">
                  <img src={profile.qr_code_url} alt="QR Code" className="w-48 h-48" />
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

        {/* Referrals List */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Referrals
            </CardTitle>
            <CardDescription>People who joined using your referral code</CardDescription>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No referrals yet. Start sharing your link!
              </p>
            ) : (
              <div className="space-y-2">
                {referrals.map((referral, index) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground">{referral.name}</p>
                      <p className="text-sm text-muted-foreground">{referral.email}</p>
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
      </div>
    </div>
  );
};

export default Dashboard;

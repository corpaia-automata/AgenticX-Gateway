import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Users, TrendingUp } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReferrals: 0,
    avgReferrals: 0,
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      navigate("/register");
      return;
    }

    // Fetch all profiles
    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("*")
      .order("referral_count", { ascending: false });

    if (error) {
      toast.error("Failed to load admin data");
      return;
    }

    setProfiles(profileData || []);

    // Calculate stats
    const totalUsers = profileData?.length || 0;
    const totalReferrals = profileData?.reduce((sum, p) => sum + p.referral_count, 0) || 0;
    const avgReferrals = totalUsers > 0 ? totalReferrals / totalUsers : 0;

    setStats({
      totalUsers,
      totalReferrals,
      avgReferrals: Math.round(avgReferrals * 10) / 10,
    });

    setLoading(false);
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate("/dashboard")} variant="secondary" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Overview of all users and referrals</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalReferrals}</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{stats.avgReferrals}</div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Phone</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Referral Code</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Referrals</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Card Status</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((profile) => (
                    <tr key={profile.id} className="border-b border-border/50">
                      <td className="p-3 text-sm text-foreground">{profile.name}</td>
                      <td className="p-3 text-sm text-muted-foreground">{profile.email}</td>
                      <td className="p-3 text-sm text-muted-foreground">{profile.phone}</td>
                      <td className="p-3 text-sm font-mono text-primary">{profile.referral_code}</td>
                      <td className="p-3 text-sm text-foreground font-semibold">
                        {profile.referral_count}
                      </td>
                      <td className="p-3 text-sm">
                        {profile.referral_count >= 5 ? (
                          <span className="text-accent font-medium">Unlocked</span>
                        ) : (
                          <span className="text-muted-foreground">Locked</span>
                        )}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;

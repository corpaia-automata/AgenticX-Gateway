import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, Users, TrendingUp, Award } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-premium">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center space-y-8">
            <div className="inline-block">
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
                <Award className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Exclusive Referral Program</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight">
              AGIX International{" "}
              <span className="bg-gradient-gold bg-clip-text text-transparent">
                Business
              </span>
              <br />
              Community
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Refer friends, unlock rewards, and get exclusive access to the premium Black Community Card
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                onClick={() => navigate("/register")}
                size="lg"
                className="bg-gradient-primary hover:opacity-90 shadow-premium"
              >
                Get Started
              </Button>
              <Button
                onClick={() => navigate("/login")}
                size="lg"
                variant="secondary"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-border bg-card shadow-premium">
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">QR Code System</h3>
              <p className="text-muted-foreground">
                Get your unique QR code and referral link to share with friends and track your growth
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-premium">
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Track Referrals</h3>
              <p className="text-muted-foreground">
                Monitor your referrals in real-time and see your progress towards unlocking rewards
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-premium">
            <CardContent className="pt-6 space-y-4">
              <div className="w-12 h-12 bg-gradient-gold rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Black Community Card</h3>
              <p className="text-muted-foreground">
                Unlock your exclusive Black Card after referring 5 people and gain premium status
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <Card className="border-border bg-card shadow-premium">
          <CardContent className="p-8 md:p-12 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of members building the community together. Sign up now and start your referral journey.
            </p>
            <Button
              onClick={() => navigate("/register")}
              size="lg"
              className="bg-gradient-primary hover:opacity-90 shadow-premium"
            >
              Create Your Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;

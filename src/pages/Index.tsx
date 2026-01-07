import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeroBackground } from "@/components/HeroBackground";
import {
  QrCode,
  Shield,
  Eye,
  Zap,
  CheckCircle2,
  ScanLine,
  LayoutDashboard,
  Users,
  Award,
  Sparkles,
  TrendingUp,
  Lock,
  ArrowRight,
  ExternalLink,
  Mail,
  FileText,
} from "lucide-react";

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
    <div className="min-h-screen bg-background">
      {/* 1. HERO SECTION */}
      <HeroBackground>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="text-center lg:text-left space-y-8">
              <div className="inline-block">
                <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-2">
                  <Sparkles className="h-4 w-4 text-white" />
                  <span className="text-sm font-medium text-white">AgenticX AI-Driven Business Community</span>
                </div>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight leading-tight">
                Join the AI-Driven
                <br />
                <span className="bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
                  Business Community
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Unlock exclusive rewards, early innovation access, and premium benefits by participating.
              </p>

              <p className="text-sm text-muted-foreground/80 uppercase tracking-wider">
                Scan · Register · Refer · Unlock Platinum
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  onClick={() => navigate("/register")}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 shadow-lg shadow-primary/50 text-lg px-8 py-6"
                >
                  Join Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  onClick={() => navigate("/login")}
                  size="lg"
                  variant="ghost"
                  className="text-lg px-8 py-6"
                >
                  Already a member? Login
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Right: QR Code Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-2xl blur-2xl transform scale-110"></div>
                <div className="relative bg-card/50 backdrop-blur-sm border border-primary/20 rounded-2xl p-8 shadow-2xl">
                  <div className="w-64 h-64 rounded-xl border-2 border-primary/30 overflow-hidden">
                    <img
                      src="/master.JPG"
                      alt="QR Code - Scan to Get Started"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-center text-sm text-muted-foreground mt-4">Scan to Get Started</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </HeroBackground>

      {/* 2. TRUST / CREDIBILITY STRIP */}
      <section className="border-y border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Launched at live</p>
                <p className="text-xs text-muted-foreground">business events</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Transparent</p>
                <p className="text-xs text-muted-foreground">referral tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Secure & private</p>
                <p className="text-xs text-muted-foreground">data protection</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Built on</p>
                <p className="text-xs text-muted-foreground">AgenticX ecosystem</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (4 SIMPLE STEPS) */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in four simple steps and unlock your path to Platinum benefits
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <Card className="border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
                  <ScanLine className="h-7 w-7 text-primary" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-primary">STEP 1</span>
                </div>
                <CardTitle className="text-2xl">Scan & Register</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Scan the QR code and create your account in seconds.
                </p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
                  <LayoutDashboard className="h-7 w-7 text-primary" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-primary">STEP 2</span>
                </div>
                <CardTitle className="text-2xl">Access Your Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  View your referral link, personal QR code, rewards, and updates.
                </p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-primary">STEP 3</span>
                </div>
                <CardTitle className="text-2xl">Refer Others</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Share your link or QR code. Every signup is tracked automatically.
                </p>
              </CardContent>
            </Card>

            {/* Step 4 */}
            <Card className="border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all border-primary/30">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/30 to-accent/20 flex items-center justify-center mb-4">
                  <Award className="h-7 w-7 text-accent" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-accent">STEP 4</span>
                </div>
                <CardTitle className="text-2xl">Unlock Platinum</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Refer 5 people and unlock Platinum Card benefits.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. PLATINUM CARD BENEFITS (HIGHLIGHT SECTION) */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-purple-950/20 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Benefits Content */}
            <div>
              <div className="inline-flex items-center gap-2 mb-6">
                <Award className="h-8 w-8 text-accent" />
                <h2 className="text-4xl md:text-5xl font-bold text-foreground">Platinum Card Benefits</h2>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <p className="text-lg text-foreground">
                    <span className="font-semibold">Chance to win 20% OFF</span> on your AgenticX product
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <p className="text-lg text-foreground">
                    Early access to events and product launches
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <p className="text-lg text-foreground">
                    Exclusive member-only pricing
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <p className="text-lg text-foreground">
                    Priority community benefits
                  </p>
                </div>
              </div>
              <div className="pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground italic">
                  Platinum access is unlocked through participation.
                </p>
              </div>
            </div>

            {/* Right: Blurred ATM Card */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-sm">
                {/* ATM Card Design - Blurred */}
                <div className="relative aspect-[85.6/53.98] rounded-2xl overflow-hidden shadow-2xl blur-md">
                  {/* Card Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900"></div>

                  {/* Card Chip */}
                  <div className="absolute top-6 left-6 w-12 h-10 bg-gradient-to-br from-yellow-400/30 to-yellow-600/30 rounded-md"></div>

                  {/* Card Number Area */}
                  <div className="absolute bottom-20 left-6 right-6">
                    <div className="flex gap-2">
                      <div className="h-8 w-12 bg-white/20 rounded"></div>
                      <div className="h-8 w-12 bg-white/20 rounded"></div>
                      <div className="h-8 w-12 bg-white/20 rounded"></div>
                      <div className="h-8 w-12 bg-white/20 rounded"></div>
                    </div>
                  </div>

                  {/* Cardholder Name */}
                  <div className="absolute bottom-12 left-6">
                    <div className="h-4 w-32 bg-white/20 rounded"></div>
                  </div>

                  {/* Expiry Date */}
                  <div className="absolute bottom-12 right-6">
                    <div className="h-4 w-16 bg-white/20 rounded"></div>
                  </div>

                  {/* Platinum Badge */}
                  <div className="absolute top-6 right-6">
                    <div className="px-3 py-1 bg-gradient-to-r from-accent/40 to-accent/20 rounded-full">
                      <span className="text-xs font-semibold text-white/80">PLATINUM</span>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/30 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/30 rounded-full blur-xl"></div>
                  </div>
                </div>

                {/* Lock Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/60 backdrop-blur-sm rounded-full p-6 border-4 border-accent/50 shadow-2xl">
                    <Lock className="h-16 w-16 text-accent" strokeWidth={2} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY JOIN THIS COMMUNITY */}
      {/* <section className="py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Why Join This Community?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-border bg-card/50 backdrop-blur-sm text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Built for AI-driven</h3>
                <p className="text-muted-foreground">business growth</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card/50 backdrop-blur-sm text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Rewards based</h3>
                <p className="text-muted-foreground">on contribution</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card/50 backdrop-blur-sm text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Designed for</h3>
                <p className="text-muted-foreground">long-term community value</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section> */}

      {/* 6. COMMUNITY GROWTH EXPLANATION */}
      {/* <section className="py-24 bg-card/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              How the Community Grows
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Everyone starts equally</h3>
                    <p className="text-sm text-muted-foreground">
                      All members begin with the same opportunities and access.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Growth through referrals</h3>
                    <p className="text-sm text-muted-foreground">
                      The community expands organically as members share and participate.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Transparent tracking</h3>
                    <p className="text-sm text-muted-foreground">
                      All rewards are transparently tracked and visible in your dashboard.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">More contribution, more access</h3>
                    <p className="text-sm text-muted-foreground">
                      Increased participation unlocks additional benefits and privileges.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section> */}

      {/* 7. FINAL CALL TO ACTION */}
      <section className="py-24 bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Start with One Scan.
            <br />
            Build Something Bigger.
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              onClick={() => navigate("/register")}
              size="lg"
              className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 shadow-lg shadow-primary/50 text-lg px-8 py-6"
            >
              Join the Community
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={() => navigate("/login")}
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-2"
            >
              Login
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* 8. FOOTER (MINIMAL) */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-6">
              <img
                src="/agenticX.png"
                alt="AgenticX Logo"
                className="h-24 md:h-32 lg:h-40 w-auto mx-auto mb-4"
              />
            </div>
            <h3 className="text-lg font-semibold mb-4">GLOBAL BUSINESS TRANSFORMATION</h3>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Join the AI-driven business community and unlock exclusive rewards through participation.
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} AgenticX. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

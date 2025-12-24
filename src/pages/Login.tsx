import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { HeroBackground } from "@/components/HeroBackground";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    // Check if user is already logged in
    const checkExistingSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error checking session:", error);
        return;
      }
      
      if (session) {
        console.log("Existing session found, redirecting to dashboard");
        navigate("/dashboard", { replace: true });
      }
    };
    
    checkExistingSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clear any previous errors
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) {
        // Handle specific auth errors with user-friendly messages
        let errorMessage = "Failed to login";
        
        if (error.message.includes("Invalid login credentials") || error.message.includes("email")) {
          errorMessage = "Invalid email or password";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please confirm your email before logging in";
        } else if (error.message.includes("Too many requests")) {
          errorMessage = "Too many login attempts. Please try again later";
        } else {
          errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
      }

      // signInWithPassword should always return a session on success
      if (!data.session) {
        console.error("No session returned from signInWithPassword");
        throw new Error("Session not established. Please try again.");
      }

      // Verify session is stored by checking localStorage
      const storedSession = await supabase.auth.getSession();
      if (!storedSession.data.session) {
        console.error("Session not persisted to storage");
        throw new Error("Session not saved. Please try again.");
      }

      console.log("Login successful, session established:", {
        userId: data.session.user.id,
        email: data.session.user.email,
      });

      toast.success("Welcome back!");
      
      // Small delay to ensure session is fully persisted before navigation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to dashboard
      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Display error message
      const errorMessage = error.message || "Failed to login. Please check your credentials and try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HeroBackground className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border bg-card/90 backdrop-blur-sm shadow-premium relative z-10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center bg-gradient-primary bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <a href="/register" className="text-primary hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </HeroBackground>
  );
};

export default Login;

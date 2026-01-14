import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { HeroBackground } from "@/components/HeroBackground";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";

const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  // Get referral code from URL and decode it (handle URL encoding)
  const rawReferralCode = searchParams.get("ref");
  const referralCode = rawReferralCode ? decodeURIComponent(rawReferralCode).trim() : null;

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("🚀 Starting registration process...");

      // Step 1: Validate referral code early (if provided)
      let referrerId: string | null = null;
      let referralCodeValid = false;

      if (referralCode) {
        // Normalize referral code: trim, lowercase, and remove any whitespace (DB uses lowercase)
        const normalizedCode = referralCode.trim().toLowerCase().replace(/\s+/g, '');
        console.log("🔍 Validating referral code:", {
          original: referralCode,
          normalized: normalizedCode,
        });

        // Use the validate_referral_code function (SECURITY DEFINER bypasses RLS)
        const { data: referrerIdFromFunction, error: functionError } = await supabase.rpc(
          "validate_referral_code",
          { code: normalizedCode }
        );

        if (functionError) {
          // Function error (network, function doesn't exist, etc.) - don't show invalid warning
          // Just log and continue without referral
          console.error("❌ Error validating referral code via function:", {
            code: functionError.code,
            message: functionError.message,
            details: functionError.details,
          });

          // Only show error if function doesn't exist (critical issue)
          if (functionError.message?.includes('function') && functionError.message?.includes('does not exist')) {
            console.error("❌ validate_referral_code function not found. Please run the SQL script in Supabase.");
            // Don't block registration - just log the error
          }
          // Don't show warning for other errors - registration continues without referral
          referralCodeValid = false;
        } else if (referrerIdFromFunction === null || referrerIdFromFunction === undefined) {
          // Function explicitly returned null - code doesn't exist
          // This is the ONLY case where we show "invalid referral code" warning
          console.warn("⚠️ Referral code not found:", normalizedCode);
          toast.warning("Invalid referral code. You can still register without it.");
          referralCodeValid = false;
        } else {
          // Function returned a valid UUID
          referrerId = referrerIdFromFunction;
          referralCodeValid = true;
          console.log("✅ Referral code validated successfully via function:", {
            code: normalizedCode,
            referrerId: referrerId,
          });
        }
      }

      // Step 2: Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) {
        console.error("❌ Auth signup error:", authError);

        // Handle specific error types with user-friendly messages
        if (authError.message.includes("rate limit") || authError.message.includes("too many")) {
          const friendlyError = new Error(
            "Too many registration attempts. Please wait a few minutes and try again, " +
            "or check your email for a confirmation link if you already registered."
          );
          friendlyError.name = authError.name;
          throw friendlyError;
        }

        throw authError;
      }

      if (!authData.user) {
        console.error("❌ No user returned from signup");
        throw new Error("Failed to create user");
      }

      console.log("✅ User created successfully:", authData.user.id);

      // Step 3: Wait for profile creation (trigger may create it automatically)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 4: Check if profile exists and create if needed
      let profileExists = false;
      let newUserProfile: any = null;

      console.log("🔍 Checking if profile exists for user:", authData.user.id);
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from("profiles")
        .select("id, referral_code, referred_by")
        .eq("id", authData.user.id)
        .single();

      if (profileCheckError) {
        console.log("⚠️ Profile check error (might be RLS or not found):", profileCheckError);
        console.log("Error code:", profileCheckError.code);
        console.log("Error message:", profileCheckError.message);
      }

      if (existingProfile && !profileCheckError) {
        console.log("✅ Profile exists (created by trigger)");
        profileExists = true;
        newUserProfile = existingProfile;
      } else {
        console.log("⚠️ Profile not found, creating manually...");

        // Wait a bit more for trigger (sometimes takes longer)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check again if trigger created it
        const { data: recheckProfile } = await supabase
          .from("profiles")
          .select("id, referral_code, referred_by")
          .eq("id", authData.user.id)
          .single();

        if (recheckProfile) {
          console.log("✅ Profile created by trigger after wait");
          profileExists = true;
          newUserProfile = recheckProfile;
        } else {
          // Try using RPC function (runs with SECURITY DEFINER, bypasses RLS)
          console.log("📝 Attempting to create profile via RPC function...");
          console.log("User ID:", authData.user.id);
          console.log("User Email:", formData.email.trim());

          const { data: generatedReferralCode, error: createError } = await supabase.rpc("create_user_profile", {
            user_id: authData.user.id,
            user_email: formData.email.trim(),
            user_name: formData.name,
            user_phone: formData.phone,
          });

          if (createError) {
            console.error("❌ RPC function error:", createError);
            console.error("Error details:", {
              message: createError.message,
              code: createError.code,
              details: createError.details,
              hint: createError.hint,
            });

            // Try direct INSERT as final fallback
            console.log("🔄 Attempting direct INSERT as fallback...");
            const { error: insertError } = await supabase
              .from("profiles")
              .insert({
                id: authData.user.id,
                email: formData.email.trim(),
                name: formData.name,
                phone: formData.phone,
                referral_code: `TEMP-${authData.user.id.substring(0, 8).toUpperCase()}`,
                referral_count: 0,
              });

            if (insertError) {
              console.error("❌ Direct INSERT also failed:", insertError);
              throw new Error(
                `Profile creation failed. Both RPC function and direct INSERT failed. ` +
                `Please ensure the database functions are set up correctly. ` +
                `Run 'supabase/simple_profile_creation.sql' in your Supabase SQL Editor. ` +
                `RPC Error: ${createError.message} | INSERT Error: ${insertError.message}`
              );
            } else {
              console.log("✅ Profile created via direct INSERT");
            }
          } else {
            console.log("✅ RPC function succeeded, referral code:", generatedReferralCode);
          }

          // Wait a moment for the profile to be fully committed
          await new Promise(resolve => setTimeout(resolve, 500));

          // Fetch the newly created profile with retries
          let retries = 3;
          let createdProfile = null;

          while (retries > 0 && !createdProfile) {
            const { data: profileData, error: fetchError } = await supabase
              .from("profiles")
              .select("id, referral_code, referred_by")
              .eq("id", authData.user.id)
              .single();

            if (profileData && !fetchError) {
              createdProfile = profileData;
              console.log("✅ Profile retrieved successfully");
            } else {
              console.warn(`⚠️ Profile fetch attempt ${4 - retries} failed:`, fetchError);
              if (retries > 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            }
            retries--;
          }

          if (createdProfile) {
            newUserProfile = createdProfile;
            profileExists = true;
          } else {
            console.error("❌ Could not retrieve profile after creation");
            console.error("This might be an RLS policy issue. Check your RLS policies for SELECT on profiles table.");
          }
        }
      }

      if (!profileExists || !newUserProfile) {
        // Provide detailed error information
        const errorDetails = {
          userId: authData.user.id,
          email: formData.email.trim(),
          profileExists,
          hasProfile: !!newUserProfile,
        };
        console.error("❌ Profile creation/retrieval failed:", errorDetails);

        throw new Error(
          `Failed to create or retrieve user profile. ` +
          `User was created successfully (ID: ${authData.user.id.substring(0, 8)}...), but profile could not be created or accessed. ` +
          `This might be due to: ` +
          `1. Missing database functions (run 'supabase/simple_profile_creation.sql') ` +
          `2. RLS policies blocking SELECT/INSERT on profiles table ` +
          `3. Database trigger not working. ` +
          `Please check the browser console for detailed error logs.`
        );
      }

      // Step 5: Handle referral linking (if valid referral code was provided)
      // This runs AFTER profile creation and does NOT block registration
      if (referralCode && referralCodeValid && referrerId) {
        console.log("🔗 Processing referral link...");

        // Prevent self-referral: Check if the new user's ID matches the referrer's ID
        if (newUserProfile.id === referrerId) {
          console.warn("⚠️ Self-referral detected, skipping referral link");
        } else {
          // Check if already referred (shouldn't happen, but safety check)
          if (newUserProfile.referred_by) {
            console.warn("⚠️ User already has a referrer, skipping referral link");
          } else {
            // Apply referral via RPC (handles both referred_by and referral_count)
            console.log("📞 Calling apply_referral function...", {
              new_user_id: authData.user.id,
              referrer_id: referrerId,
            });

            const { data: applyData, error: applyError } = await supabase.rpc("apply_referral", {
              new_user_id: authData.user.id,
              referrer_id: referrerId,
            });

            if (applyError) {
              // Log error with full details
              console.error("❌ Error applying referral:", {
                error: applyError,
                message: applyError.message,
                details: applyError.details,
                hint: applyError.hint,
                new_user_id: authData.user.id,
                referrer_id: referrerId,
              });

              // Show toast notification so user knows something went wrong
              toast.error("Referral link failed to apply. Registration successful, but referral not counted.");
            } else {
              console.log("✅ Referral applied successfully", applyData);

              // Verify the update worked by checking the profile
              const { data: verifyProfile } = await supabase
                .from("profiles")
                .select("referred_by, referral_count")
                .eq("id", authData.user.id)
                .single();

              console.log("🔍 Verification - New user profile:", verifyProfile);

              // Check referrer's updated count
              const { data: verifyReferrer } = await supabase
                .from("profiles")
                .select("referral_count")
                .eq("id", referrerId)
                .single();

              console.log("🔍 Verification - Referrer's count:", verifyReferrer);

              if (verifyProfile?.referred_by === referrerId) {
                toast.success("Referral link applied successfully!");
              } else {
                console.warn("⚠️ Verification failed: referred_by not set correctly");
              }
            }
          }
        }
      }

      console.log("🎉 Registration completed successfully!");

      // Always redirect to success page after successful registration
      // The success page will handle checking for session and showing appropriate content
      if (authData.session) {
        toast.success("Registration successful! Welcome!");
        navigate("/success");
      } else {
        // Wait a moment and check again (session might be establishing)
        await new Promise(resolve => setTimeout(resolve, 500));
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          toast.success("Registration successful! Welcome!");
          navigate("/success");
        } else {
          // If email confirmation is required, session won't be available
          toast.success("Registration successful! Please check your email to confirm your account.");
          navigate("/success");
        }
      }
    } catch (error: any) {
      console.error("❌ Registration error:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      toast.error(error.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <HeroBackground className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        <Card className="w-full border-border bg-card/90 backdrop-blur-sm shadow-premium relative z-10">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center bg-gradient-primary bg-clip-text text-transparent">
              Join the Community
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              {referralCode
                ? "You've been invited! Create your account to get started."
                : "Create your account and start referring"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-secondary border-border"
                />
              </div>
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
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-secondary border-border"
                />
              </div>
              {referralCode && (
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm text-primary">
                    Referral Code: <span className="font-mono font-bold">{referralCode}</span>
                  </p>
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <a href="/login" className="text-primary hover:underline">
                  Sign in
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <QRCodeGenerator />
      </div>
    </HeroBackground>
  );
};

export default Register;

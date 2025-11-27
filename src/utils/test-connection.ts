// Test Supabase Cloud Connection
// Run this in browser console to verify connection

import { supabase } from "@/integrations/supabase/client";

export const testSupabaseConnection = async () => {
  console.log("🔍 Testing Supabase Cloud Connection...");
  
  try {
    // Test 1: Check if we can connect
    console.log("1. Testing connection...");
    const { data, error } = await supabase.from("profiles").select("count").limit(1);
    
    if (error) {
      if (error.message.includes("relation") || error.message.includes("does not exist")) {
        console.error("❌ ERROR: Tables don't exist yet!");
        console.error("👉 You need to run the migration in Supabase SQL Editor");
        console.error("👉 Open: supabase/migrations/complete_setup.sql");
        return false;
      }
      console.error("❌ Connection Error:", error);
      return false;
    }
    
    console.log("✅ Connection successful!");
    console.log("✅ Tables exist!");
    
    // Test 2: Check current session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log("✅ User is logged in:", session.user.email);
    } else {
      console.log("ℹ️ No user logged in (this is normal)");
    }
    
    return true;
  } catch (err: any) {
    console.error("❌ Test failed:", err);
    return false;
  }
};

// Make it available globally for easy testing
if (typeof window !== "undefined") {
  (window as any).testSupabase = testSupabaseConnection;
}



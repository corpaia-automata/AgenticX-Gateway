// Test Supabase Cloud Connection
// Run this in browser console to verify connection

import { supabase, testConnection } from "@/integrations/supabase/client";

export const testSupabaseConnection = async () => {
  console.log("🔍 Testing Supabase Cloud Connection...");
  
  try {
    // Use the built-in test connection from client
    const result = await testConnection();
    
    if (result.success) {
      console.log("✅", result.message);
      if (result.hasSession) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log("✅ User is logged in:", session.user.email);
        }
      } else {
        console.log("ℹ️ No user logged in (this is normal)");
      }
      
      // Additional test: Try to query profiles table
      console.log("2. Testing database query...");
      const { data, error } = await supabase.from("profiles").select("count").limit(1);
      
      if (error) {
        if (error.message.includes("relation") || error.message.includes("does not exist")) {
          console.warn("⚠️ Tables don't exist yet - this is normal for new projects");
          console.log("👉 Run migrations in Supabase SQL Editor to create tables");
        } else {
          console.warn("⚠️ Query warning:", error.message);
        }
      } else {
        console.log("✅ Database query successful!");
      }
      
      return true;
    } else {
      console.error("❌ Connection test failed:", result.error);
      return false;
    }
  } catch (err: any) {
    console.error("❌ Test failed:", err);
    return false;
  }
};

// Make it available globally for easy testing
if (typeof window !== "undefined") {
  (window as any).testSupabase = testSupabaseConnection;
}



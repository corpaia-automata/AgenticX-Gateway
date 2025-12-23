import { useState } from "react";
import { testConnection, supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2, AlertCircle, Database, Key, Globe, User } from "lucide-react";

interface TestResult {
  success: boolean;
  hasSession?: boolean;
  message?: string;
  error?: string;
  envVars?: {
    urlPresent: boolean;
    keyPresent: boolean;
    urlValue?: string;
    keyMasked?: string;
  };
  authStatus?: {
    connected: boolean;
    hasSession: boolean;
    userEmail?: string;
  };
  databaseStatus?: {
    connected: boolean;
    tablesExist: boolean;
    error?: string;
  };
}

const TestConnection = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const maskKey = (key: string | undefined): string => {
    if (!key) return "Not set";
    if (key.length <= 20) return "***";
    return `${key.substring(0, 8)}...${key.substring(key.length - 8)}`;
  };

  const runTest = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Get the key for masking (not exposed by testConnection for security)
      const key = 
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
        import.meta.env.VITE_SUPABASE_ANON_KEY ||
        import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // Run connection test (now returns all the info we need)
      const connectionResult = await testConnection();

      // Enhance envVars with masked key
      const enhancedResult: TestResult = {
        ...connectionResult,
        envVars: connectionResult.envVars ? {
          ...connectionResult.envVars,
          keyMasked: maskKey(key),
        } : {
          urlPresent: false,
          keyPresent: false,
          keyMasked: maskKey(key),
        },
      };

      setResult(enhancedResult);
    } catch (err: any) {
      setResult({
        success: false,
        error: err.message || "Test failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Supabase Connection Test
            </CardTitle>
            <CardDescription>
              Test your Supabase connection, environment variables, authentication, and database access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={runTest}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  Run Connection Test
                </>
              )}
            </Button>

            {result && (
              <div className="space-y-4 mt-6">
                {/* Overall Status */}
                <Alert variant={result.success ? "default" : "destructive"}>
                  {result.success ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {result.success ? "Connection Successful" : "Connection Failed"}
                  </AlertTitle>
                  <AlertDescription>
                    {result.message || result.error}
                  </AlertDescription>
                </Alert>

                {/* Environment Variables */}
                {result.envVars && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        Environment Variables
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Supabase URL</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {result.envVars.urlPresent ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-muted-foreground font-mono">
                                {result.envVars.urlValue ? `${result.envVars.urlValue.substring(0, 30)}...` : "Set"}
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span className="text-sm text-red-500">Missing</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Anon Key</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {result.envVars.keyPresent ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-muted-foreground font-mono">
                                {result.envVars.keyMasked}
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span className="text-sm text-red-500">Missing</span>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Authentication Status */}
                {result.authStatus && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Authentication Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="font-medium">Auth Service</span>
                        <div className="flex items-center gap-2">
                          {result.authStatus.connected ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-500">Connected</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span className="text-sm text-red-500">Failed</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="font-medium">Active Session</span>
                        <div className="flex items-center gap-2">
                          {result.authStatus.hasSession ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-muted-foreground">
                                {result.authStatus.userEmail || "Logged in"}
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-muted-foreground">No active session</span>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Database Status */}
                {result.databaseStatus && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Database Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="font-medium">Database Connection</span>
                        <div className="flex items-center gap-2">
                          {result.databaseStatus.connected ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-500">Connected</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span className="text-sm text-red-500">Failed</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="font-medium">Tables Status</span>
                        <div className="flex items-center gap-2">
                          {result.databaseStatus.tablesExist ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-500">Tables exist</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-yellow-500">
                                {result.databaseStatus.error || "Tables not found"}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {result.databaseStatus.error && (
                        <Alert variant="default">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            {result.databaseStatus.error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Instructions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Other Testing Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>Browser Console:</strong> Open browser console and run{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">window.testSupabase()</code>
                </p>
                <p>
                  <strong>Programmatic:</strong> Import and use{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">testConnection()</code> from{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">@/integrations/supabase/client</code>
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestConnection;


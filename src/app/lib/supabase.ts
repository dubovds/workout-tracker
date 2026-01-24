import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (cachedClient) {
    return cachedClient;
  }

  // In Next.js, NEXT_PUBLIC_ variables are available at build time
  // They should be embedded in the client bundle
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Debug logging (only in development or if explicitly enabled)
  if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEBUG === "true") {
    console.log("Supabase client initialization:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      urlLength: supabaseUrl?.length ?? 0,
      keyLength: supabaseAnonKey?.length ?? 0,
      urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "missing",
    });
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    const missingVars = [];
    if (!supabaseUrl) missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!supabaseAnonKey) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    
    const errorMessage = `Missing Supabase environment variables: ${missingVars.join(", ")}. Please configure them in your deployment settings (Vercel → Settings → Environment Variables).`;
    
    // Log to console for debugging
    console.error("Supabase configuration error:", errorMessage);
    
    throw new Error(errorMessage);
  }

  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch (urlError) {
    const errorMessage = `Invalid NEXT_PUBLIC_SUPABASE_URL format: ${supabaseUrl.substring(0, 50)}...`;
    console.error("Supabase URL validation error:", errorMessage, urlError);
    throw new Error(errorMessage);
  }

  // Validate key format (should start with eyJ for JWT)
  if (!supabaseAnonKey.startsWith("eyJ")) {
    console.warn("Supabase anon key format looks unusual. Expected JWT token starting with 'eyJ'");
  }

  cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Don't persist session in server components
      autoRefreshToken: false,
    },
  });
  
  return cachedClient;
}

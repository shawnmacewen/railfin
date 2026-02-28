type SupabaseServerConfig = {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
};

function readRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getSupabaseServerConfig(): SupabaseServerConfig {
  return {
    supabaseUrl: readRequiredEnv("SUPABASE_URL"),
    supabaseServiceRoleKey: readRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

/**
 * Minimal scaffold for server-side Supabase wiring.
 * Replace this object with a real Supabase client initialization when dependency wiring is ready.
 */
export function createSupabaseServerClient() {
  const config = getSupabaseServerConfig();

  return {
    kind: "supabase-server-client-scaffold",
    url: config.supabaseUrl,
    usingServiceRoleKey: true,
  };
}

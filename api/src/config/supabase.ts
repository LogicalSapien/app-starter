import { createClient, SupabaseClient } from "@supabase/supabase-js";
import config from "./config.js";

const supabaseUrl = config.supabaseUrl;
const supabaseAnonKey = config.supabaseAnonKey;
const supabaseServiceKey = config.supabaseServiceRoleKey;

// Client for user authentication (uses anon key)
export const supabaseClient: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
);

// Admin client for database operations (uses service role key)
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

/**
 * Test database connection via Supabase.
 * Returns true when the Supabase instance responds without error.
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("users")
      .select("count")
      .limit(1);

    if (error) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export default supabaseClient;

/**
 * Shared Supabase client — single instance for the entire app.
 *
 * Both AuthContext and the API service import from here so auth state
 * stays in sync (a 401 in api.ts triggers the same client's sign-out).
 */
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { config } from "@/config/config";

if (!config.supabaseUrl || !config.supabaseAnonKey) {
  throw new Error(
    "Supabase credentials are missing. " +
      "Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY " +
      "in your .env or Doppler config.",
  );
}

export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

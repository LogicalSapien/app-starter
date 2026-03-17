import Constants from "expo-constants";

interface AppConfig {
  apiBaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

function getConfig(): AppConfig {
  const extra = Constants.expoConfig?.extra;

  if (!extra) {
    throw new Error(
      "Missing Expo config extras. Ensure app.config.ts is configured correctly.",
    );
  }

  const supabaseUrl = extra.supabaseUrl ?? "";
  const supabaseAnonKey = extra.supabaseAnonKey ?? "";

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "[Config] EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY " +
        "must be set. Auth will not work without them.",
    );
  }

  return {
    apiBaseUrl: extra.apiBaseUrl ?? "http://localhost:3001/api/v1",
    supabaseUrl,
    supabaseAnonKey,
  };
}

export const config = getConfig();

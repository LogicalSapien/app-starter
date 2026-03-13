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
      "Missing Expo config extras. Ensure app.config.ts is configured correctly."
    );
  }

  return {
    apiBaseUrl: extra.apiBaseUrl ?? "http://localhost:3000",
    supabaseUrl: extra.supabaseUrl ?? "",
    supabaseAnonKey: extra.supabaseAnonKey ?? "",
  };
}

export const config = getConfig();

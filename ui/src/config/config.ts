interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  apiUrl: string;
  environment: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

export const config: AppConfig = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "",
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1",
  environment: import.meta.env.VITE_ENVIRONMENT || "development",
  get isDevelopment() {
    return this.environment === "development";
  },
  get isProduction() {
    return this.environment === "production";
  },
};

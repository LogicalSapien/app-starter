/**
 * Centralized configuration using environment variables.
 * Works with Doppler CLI: `doppler run --` or any system that populates process.env.
 */

export const config = {
  // Server Configuration
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  // Rate limiting (configurable)
  rateLimitEnabled: (process.env.RATE_LIMIT_ENABLED ?? "true") !== "false",
  rateLimitWindowMs: parseInt(
    process.env.RATE_LIMIT_WINDOW_MS || String(60 * 1000),
    10,
  ),
  rateLimitMax: process.env.RATE_LIMIT_MAX
    ? parseInt(process.env.RATE_LIMIT_MAX, 10)
    : process.env.NODE_ENV === "development"
      ? 5000
      : 10000,

  // CORS Configuration
  frontendUrls: process.env.FRONTEND_URLS,

  // Database Configuration
  databaseUrl: process.env.DATABASE_URL!,

  // Supabase Configuration
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY!,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,

  // Logging Configuration
  logLevel: process.env.LOG_LEVEL || "INFO",

  // Error Monitoring (optional)
  sentryDsn: process.env.SENTRY_DSN,

  // Helper functions
  isDevelopment: () => process.env.NODE_ENV === "development",
  isProduction: () => process.env.NODE_ENV === "production",
  isTest: () => process.env.NODE_ENV === "test",
} as const;

// Validation for required environment variables
const requiredEnvVars = [
  "DATABASE_URL",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

export function validateConfig(): void {
  /**
   * Ensure all required environment variables are populated at startup.
   * Throws with a readable message listing missing keys so deployments fail fast.
   */
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  // Log configuration source
  if (process.env.DOPPLER_ENVIRONMENT) {
    console.log(
      `Using Doppler configuration (${process.env.DOPPLER_ENVIRONMENT} environment)`,
    );
  } else {
    console.log("Using system environment variables");
  }
}

export default config;

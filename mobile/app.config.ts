import { ExpoConfig, ConfigContext } from "expo/config";
import versionConfig from "./version.json";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  // TODO: Replace with your app name and slug
  name: "App Starter",
  slug: "app-starter",
  version: versionConfig.version,
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "appstarter", // TODO: Replace with your app's deep link scheme
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  runtimeVersion: {
    policy: "appVersion",
  },
  updates: {
    url: "https://u.expo.dev/your-eas-project-id", // TODO: Replace with your EAS project ID
  },
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.yourcompany.appstarter", // TODO: Replace with your iOS bundle ID
    buildNumber: versionConfig.ios.buildNumber,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: "com.yourcompany.appstarter", // TODO: Replace with your Android package name
    versionCode: versionConfig.android.versionCode,
  },
  web: {
    bundler: "metro",
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    [
      "expo-splash-screen",
      {
        image: "./assets/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
  ],
  extra: {
    apiBaseUrl:
      process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1",
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
    eas: {
      projectId: "your-eas-project-id", // TODO: Replace with your EAS project ID from expo.dev
    },
  },
});

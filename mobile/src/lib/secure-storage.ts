/**
 * SecureStore-backed storage adapter for Supabase auth.
 *
 * Uses expo-secure-store on native (encrypted keychain / keystore)
 * and falls back to localStorage on web where SecureStore is unavailable.
 */
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const WEB_PREFIX = "sb-";

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem(WEB_PREFIX + key);
    }
    return SecureStore.getItemAsync(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.setItem(WEB_PREFIX + key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.removeItem(WEB_PREFIX + key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

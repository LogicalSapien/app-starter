import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { config } from "@/config/config";
import { supabase } from "@/lib/supabase";

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: config.apiBaseUrl,
    timeout: 15_000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Inject auth token on every request
  client.interceptors.request.use(
    async (
      requestConfig: InternalAxiosRequestConfig,
    ): Promise<InternalAxiosRequestConfig> => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.access_token) {
          requestConfig.headers.Authorization = `Bearer ${session.access_token}`;
        }
      } catch {
        // Proceed without auth header if token retrieval fails
      }
      return requestConfig;
    },
  );

  // Response error handling — uses the SAME supabase instance as AuthContext,
  // so a 401 sign-out here updates auth state app-wide.
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        const { status } = error.response;

        if (status === 401) {
          // Token expired or invalid — sign out
          supabase.auth.signOut();
        }

        if (status >= 500) {
          console.error("[API] Server error:", status, error.response.data);
        }
      } else if (error.request) {
        console.error("[API] Network error — no response received");
      }

      return Promise.reject(error);
    },
  );

  return client;
}

export const api = createApiClient();

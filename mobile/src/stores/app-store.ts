import { create } from "zustand";

interface AppState {
  hasCompletedOnboarding: boolean;
  setOnboardingComplete: () => void;
}

/**
 * Lightweight Zustand store for local-only UI state.
 *
 * Use TanStack Query for server state; use Zustand for things
 * that don't belong in a server cache (onboarding flags, UI prefs, etc.).
 */
export const useAppStore = create<AppState>((set) => ({
  hasCompletedOnboarding: false,
  setOnboardingComplete: () => set({ hasCompletedOnboarding: true }),
}));

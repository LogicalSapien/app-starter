import { renderHook, waitFor } from "@testing-library/react-native";
import { type ReactNode } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("AuthContext", () => {
  it("provides auth values after loading", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.session).toBeNull();
    expect(typeof result.current.signIn).toBe("function");
    expect(typeof result.current.signUp).toBe("function");
    expect(typeof result.current.signOut).toBe("function");
    expect(typeof result.current.resetPassword).toBe("function");
    expect(typeof result.current.signInAsGuest).toBe("function");
    expect(result.current.isGuest).toBe(false);
  });

  it("throws when used outside AuthProvider", () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth must be used within an AuthProvider");
  });
});

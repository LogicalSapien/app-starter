import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/query-keys";
import { fetchCurrentUser } from "@/services/user-service";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Fetches the signed-in user's profile from the API.
 * Automatically disabled when unauthenticated or in guest mode.
 */
export function useCurrentUser() {
  const { session, isGuest } = useAuth();

  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: fetchCurrentUser,
    enabled: !!session && !isGuest,
  });
}

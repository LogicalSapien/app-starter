/**
 * Centralized query keys for TanStack Query.
 *
 * Using a factory keeps cache invalidation predictable:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.users.me() })
 */
export const queryKeys = {
  users: {
    all: () => ["users"] as const,
    me: () => ["users", "me"] as const,
    detail: (id: string) => ["users", id] as const,
  },
} as const;

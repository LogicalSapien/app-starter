import { api } from "@/services/api";

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await api.get<User>("/users/me");
  return data;
}

export async function updateUser(
  updates: Partial<Pick<User, "displayName">>,
): Promise<User> {
  const { data } = await api.patch<User>("/users/me", updates);
  return data;
}

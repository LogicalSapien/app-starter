const mockAuth = {
  getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
  signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
  signUp: jest.fn().mockResolvedValue({ error: null }),
  signOut: jest.fn().mockResolvedValue({}),
  resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null }),
  onAuthStateChange: jest.fn().mockReturnValue({
    data: { subscription: { unsubscribe: jest.fn() } },
  }),
};

export const createClient = jest.fn(() => ({
  auth: mockAuth,
}));

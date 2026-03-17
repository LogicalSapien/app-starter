export default {
  expoConfig: {
    version: "1.0.0",
    extra: {
      apiBaseUrl: "http://localhost:3001/api/v1",
      supabaseUrl: "http://localhost:54321",
      supabaseAnonKey: "test-anon-key",
      eas: { projectId: "test-project-id" },
    },
  },
};

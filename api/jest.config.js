/** @type {import('jest').Config} */
export default {
  // Use ts-jest preset for TypeScript
  preset: "ts-jest/presets/default-esm",
  // Test environment
  testEnvironment: "node",

  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // Transform files with ts-jest
  extensionsToTreatAsEsm: [".ts"],

  // Module name mapping for ESM imports
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  // Test file patterns
  testMatch: ["**/__tests__/**/*.(test|spec).ts", "**/?(*.)+(spec|test).ts"],

  // Files to ignore
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/coverage/"],

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // Coverage configuration
  collectCoverage: false, // Enable with --coverage flag
  collectCoverageFrom: [
    "src/**/*.{ts,js}",
    "!src/**/*.d.ts",
    "!src/**/*.test.{ts,js}",
    "!src/**/*.spec.{ts,js}",
    "!src/types/**/*",
  ],

  // Coverage thresholds — 60% requirement
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },

  // Coverage reporters
  coverageReporters: [
    "text",
    "text-summary",
    "html",
    "lcov",
    "json",
    "json-summary",
  ],

  // Coverage directory
  coverageDirectory: "coverage",

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Transform configuration
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          module: "esnext",
          noImplicitReturns: false,
          noImplicitAny: false,
          strict: false,
        },
        diagnostics: {
          ignoreCodes: [1343],
        },
      },
    ],
  },

  // Test timeout
  testTimeout: 30000,

  // Verbose output
  verbose: true,

  // Detect leaked handles
  detectLeaks: false,

  // Force exit after tests complete
  forceExit: true,

  // Run tests in random order
  randomize: true,
};

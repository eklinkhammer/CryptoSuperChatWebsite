export default {
  preset: "ts-jest/presets/default-esm", // Use ts-jest with ESM support
  testEnvironment: "node", // Use "node" or "jsdom" depending on your project
  extensionsToTreatAsEsm: [".ts"], // Treat TypeScript files as ES modules
  transform: {
    "^.+\\.ts?$": [
      "ts-jest",
      {
        useESM: true, // Enable ESM support in ts-jest
      },
    ],
  },
  moduleNameMapper: {
    // Map paths if using path aliases in tsconfig.json
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["**/__tests__/**/*.test.ts", "**/?(*.)+(spec|test).ts"], // Match test files
  setupFilesAfterEnv: ["./tests/setup/jest.setup.ts"],
};


module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  // setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 10000,
  // Add environment variables for testing
  setupFiles: ['<rootDir>/tests/env-setup.js'],
  // Skip TypeScript checking for tests
  globals: {
    'ts-jest': {
      isolatedModules: true,
      tsconfig: {
        skipLibCheck: true,
        noImplicitAny: false,
        strictNullChecks: false,
        strictFunctionTypes: false,
        noImplicitReturns: false,
      }
    }
  },
};

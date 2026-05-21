import { createDefaultEsmPreset, type JestConfigWithTsJest } from 'ts-jest';

const presetConfig = createDefaultEsmPreset({
  tsconfig: 'tsconfig.test.json',
});

const jestConfig: JestConfigWithTsJest = {
  ...presetConfig,
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coveragePathIgnorePatterns: ['\\.interface\\.ts$'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};

export default jestConfig;

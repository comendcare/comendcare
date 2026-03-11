export default {
  preset: "ts-jest/presets/default-esm", // use the ESM preset
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { useESM: true }],
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1", // fix for ts-jest + ESM imports
  },
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.test.json"
    }
  }
}

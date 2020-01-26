module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePaths: [
    "<rootDir>/src",
    "<rootDir>/node_modules"
  ],
  moduleFileExtensions: [
    "ts",
    "js",
    "json"
  ],
  transform: {
    "^.+\\.ts$": "ts-jest"
  },
  testRegex: "\\.spec\\.(ts|js)$",
  testEnvironment: "node",
  collectCoverage: true, 
  coverageDirectory: "<rootDir>/test/coverage-jest"
};
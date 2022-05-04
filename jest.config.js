const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  clearMocks: true,
  moduleDirectories: ['node_modules', '<rootDir>/'],
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/assets/__mocks__/SvgrMock.jsx',
  },
  restoreMocks: true,
  setupFilesAfterEnv: ['./setupTests.js'],
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)

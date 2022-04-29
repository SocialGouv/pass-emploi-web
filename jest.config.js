const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  clearMocks: true,
  moduleDirectories: ['node_modules', '<rootDir>/'],
  restoreMocks: true,
  setupFilesAfterEnv: ['./setupTests.js'],
  testEnvironment: 'jest-environment-jsdom',
}

// FIXME waiting for next@12.1.6 https://github.com/vercel/next.js/commit/23c82e42af6f8297ef28a4e6fd40f95e4891d7d5
const jestConfig = async () => {
  const nextJestConfig = await createJestConfig(customJestConfig)()
  return {
    ...nextJestConfig,
    moduleNameMapper: {
      '\\.svg$': '<rootDir>/assets/__mocks__/SvgrMock.jsx',
      ...nextJestConfig.moduleNameMapper,
    },
  }
}

module.exports = jestConfig

const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  clearMocks: true,
  moduleDirectories: ['node_modules', '<rootDir>/'],
  moduleNameMapper: {
    // https://github.com/vercel/next.js/pull/36787
    '^.+\\.(svg)$': '<rootDir>/assets/__mocks__/SvgrMock.jsx',
  },
  restoreMocks: true,
  setupFilesAfterEnv: ['./setupTests.ts'],
  testEnvironment: 'jest-environment-jsdom',
}

const jestConfig = async () => {
  const nextJestConfig = await createJestConfig(customJestConfig)()
  // https://github.com/vercel/next.js/issues/35634
  nextJestConfig.transformIgnorePatterns = ['/node_modules/(?!@?firebase)']
  return nextJestConfig
}

module.exports = jestConfig

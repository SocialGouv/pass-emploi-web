module.exports = {
	collectCoverageFrom: [
		'**/*.{js,jsx,ts,tsx}',
		'!**/*.d.ts',
		'!**/node_modules/**',
	],
	moduleNameMapper: {
		// Handle CSS imports (with CSS modules)
		'^.+\\.module\\.(css|sass|scss)$':
			'<rootDir>/styles/__mocks__/styleMock.js',

		/* Handle image imports
    https://jestjs.io/docs/webpack#handling-static-assets */
		'^.+\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
		'^components/(.*)$': '<rootDir>/components/$1',
		'^pages/(.*)$': '<rootDir>/pages/$1',
		'^utils/(.*)$': '<rootDir>/utils/$1',
		'^referentiel/(.*)$': '<rootDir>/referentiel/$1',
		'^interfaces/(.*)$': '<rootDir>/interfaces/$1',
	},
	testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
	testEnvironment: 'jsdom',
	transform: {
		/* Use babel-jest to transpile tests with the next/babel preset
    https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object */
		'^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
	},
	transformIgnorePatterns: [
		'/node_modules/',
		'^.+\\.module\\.(css|sass|scss)$',
	],
	setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
}

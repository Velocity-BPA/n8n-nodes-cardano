module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/test'],
	testMatch: ['**/*.test.ts', '**/*.spec.ts'],
	moduleFileExtensions: ['ts', 'js', 'json'],
	collectCoverageFrom: [
		'**/*.ts',
		'!**/node_modules/**',
		'!**/dist/**',
		'!**/*.d.ts',
		'!**/test/**',
	],
	coverageDirectory: 'coverage',
	verbose: true,
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/$1',
	},
};

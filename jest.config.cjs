require('dotenv').config({ path: '.env.test' });

module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.js'],
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    testMatch: ['**/tests/**/*.test.js'],
    transformIgnorePatterns: [
        '/node_modules/(?!into-stream|@azure/storage-blob)', // Permite que estos módulos se transformen
    ],
};

require('dotenv').config({ path: '.env.test' });

module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverage: true,
    collectCoverageFrom: ['src/app/api/**/*.js'],
};

require('dotenv').config({ path: '.env.test' });

module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverage: true,
  roots: ['<rootDir>/src/tests'],
  collectCoverageFrom: [
    'src/controllers/**/*.js',
    'src/routes/**/*.js',
    'src/utils/**/*.js',
    'src/validation/**/*.js',
    'src/middlewares/**/*.js',
    '!**/node_modules/**',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

// jest.config.mjs
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': ['babel-jest', { configFile: './babel.config.mjs' }]
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(into-stream)/)' // transformar into-stream
  ],
  moduleFileExtensions: ['js', 'json'],
  roots: ['<rootDir>/src/tests'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
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
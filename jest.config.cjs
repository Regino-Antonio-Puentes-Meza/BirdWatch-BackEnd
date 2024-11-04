require('dotenv').config({ path: '.env.test' });

module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.js'],
    transform: {
        '^.+\\.js$': 'babel-jest', // Asegúrate de que Babel se use para transformar archivos JS
    },
    testMatch: ['**/tests/**/*.test.js'], // Asegúrate de que tus pruebas estén en la carpeta correcta
};

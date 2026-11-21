const nextJest = require('next/jest');

const createJestConfig = nextJest({
    dir: './',
});

/** @type {import('jest').Config} */
const config = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    testMatch: [
        '<rootDir>/__tests__/**/*.test.{js,jsx}',
    ],
};

module.exports = createJestConfig(config);

module.exports = {
    moduleFileExtensions: [
        'js',
        'json',
        'ts',
    ],
    rootDir: '.',
    testMatch: [
        '<rootDir>/test/**/*.spec.ts',
        '<rootDir>/test/**/**.test.ts'
    ],
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: [
        'src/**/*.(t|j)s',
        '!src/main.ts',
        '!src/**/*.module.ts',
        '!src/**/*Entity.ts',
        '!src/**/*.enum.ts',
        '!src/**/*.interface.ts',
        '!src/**/*.dto.ts',
        '!src/Migrations/**/*',
        '!src/Infrastructure/Config/**/*',
        '!src/Infrastructure/Modules/**/*',
        '!src/Infrastructure/Middlewares/**/*',
        '!src/Infrastructure/Interceptors/**/*',
        '!src/Infrastructure/Exceptions/**/*',
        '!src/Shared/Enums/**/*',
    ],
    coverageDirectory: './coverage',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
    },
    setupFilesAfterEnv: ['./jest.setup.js'],
    verbose: true,
};
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.module\\.css$': 'identity-obj-proxy',
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(axios)/)', // axios をトランスパイル対象に
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 80,
      functions: 100,
      lines: 90
    }
  },
  testMatch: [
    '**/src/**/__tests__/**/*.[jt]s?(x)',
    '**/src/**/*.{spec,test}.[jt]s?(x)',
    '**/tests/**/*.{spec,test}.[jt]s?(x)'
  ]
};

export default {
  displayName: '@lampung-devtechtech/web',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/next/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@lampung-devtech/shared-ui$': '<rootDir>/../../packages/shared-ui/src/index.ts',
    '^@lampung-devtech/shared-ui/(.*)$': '<rootDir>/../../packages/shared-ui/src/$1',
  },
  transformIgnorePatterns: ['node_modules/(?!(next-intl|use-intl)/)'],
  coverageDirectory: 'test-output/jest/coverage',
};

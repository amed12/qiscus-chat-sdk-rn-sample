module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-.*|@notifee|@react-native-firebase)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^components/(.*)$': '<rootDir>/app/components/$1',
    '^screens/(.*)$': '<rootDir>/app/screens/$1',
    '^utils/(.*)$': '<rootDir>/app/utils/$1',
    '^qiscus$': '<rootDir>/app/qiscus',
    '^qiscus/(.*)$': '<rootDir>/app/qiscus/$1',
    '^assets/(.*)$': '<rootDir>/assets/$1',
  },
};

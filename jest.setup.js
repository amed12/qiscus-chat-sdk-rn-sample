// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Firebase
jest.mock('@react-native-firebase/app', () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
}));

jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    hasPermission: jest.fn(() => Promise.resolve(true)),
    requestPermission: jest.fn(() => Promise.resolve(true)),
    onMessage: jest.fn(),
    getToken: jest.fn(() => Promise.resolve('mock-token')),
  })),
}));

// Mock Notifee
jest.mock('@notifee/react-native', () => ({
  createChannel: jest.fn(),
  displayNotification: jest.fn(),
  requestPermission: jest.fn(() => Promise.resolve(1)),
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    replace: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Silence the warning: Animated: `useNativeDriver` is not supported
// Already mocked above

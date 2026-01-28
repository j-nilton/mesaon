import { vi } from 'vitest';

// Define global __DEV__
// @ts-ignore
global.__DEV__ = true;

// Define process.env.EXPO_OS
process.env.EXPO_OS = 'web';

// Mock global.expo
// @ts-ignore
global.expo = {
  EventEmitter: class EventEmitter {
    addListener() { return { remove: () => {} }; }
    removeListener() {}
    removeAllListeners() {}
    listenerCount() { return 0; }
    emit() {}
  },
  modules: {}
};

// Mock expo-router
vi.mock('expo-router', () => ({
  router: {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  },
}));

// Mock console methods to avoid noise
global.console = {
  ...console,
  // log: vi.fn(),
  // error: vi.fn(),
  // warn: vi.fn(),
};

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => {
  let store: Record<string, string> = {};
  return {
    default: {
      getItem: vi.fn((key: string) => {
        return Promise.resolve(store[key] || null);
      }),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
        return Promise.resolve(null);
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
        return Promise.resolve(null);
      }),
      clear: vi.fn(() => {
        store = {};
        return Promise.resolve(null);
      }),
      getAllKeys: vi.fn(() => Promise.resolve(Object.keys(store))),
    },
  };
});

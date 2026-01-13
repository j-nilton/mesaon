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

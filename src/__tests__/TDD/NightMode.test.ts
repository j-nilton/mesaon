import { describe, it, expect, beforeEach, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interfaces that define the expected behavior (Contract)
interface Theme {
  mode: 'light' | 'dark';
  colors: {
    background: string;
    text: string;
    card: string;
    primary: string;
  };
}

// Hypothetical Service Class we want to implement
class ThemeService {
  private theme: Theme;
  private storageKey = '@mesaon_theme';

  constructor() {
    this.theme = {
        mode: 'light',
        colors: {
            background: '#FFFFFF',
            text: '#000000',
            card: '#F5F5F5',
            primary: '#FF0000'
        }
    };
  }

  getTheme(): Theme {
    throw new Error("Not implemented");
  }

  async toggleTheme(): Promise<void> {
    throw new Error("Not implemented");
  }

  async loadTheme(): Promise<void> {
    throw new Error("Not implemented");
  }
}

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
}));

describe('Night Mode (TDD)', () => {
  let themeService: ThemeService;

  beforeEach(() => {
    themeService = new ThemeService();
    vi.clearAllMocks();
  });

  it('should initialize with light mode by default', () => {
    const theme = themeService.getTheme();
    expect(theme.mode).toBe('light');
    expect(theme.colors.background).toBe('#FFFFFF');
  });

  it('should toggle theme from light to dark', async () => {
    // Setup initial state (light)
    expect(themeService.getTheme().mode).toBe('light');

    // Action
    await themeService.toggleTheme();

    // Assert
    const theme = themeService.getTheme();
    expect(theme.mode).toBe('dark');
    expect(theme.colors.background).toBe('#121212'); // Dark background
    expect(theme.colors.text).toBe('#FFFFFF'); // Light text
  });

  it('should toggle theme from dark to light', async () => {
    // Setup initial state (dark)
    await themeService.toggleTheme(); // Light -> Dark
    expect(themeService.getTheme().mode).toBe('dark');

    // Action
    await themeService.toggleTheme(); // Dark -> Light

    // Assert
    const theme = themeService.getTheme();
    expect(theme.mode).toBe('light');
    expect(theme.colors.background).toBe('#FFFFFF');
  });

  it('should persist theme preference when toggled', async () => {
    await themeService.toggleTheme();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@mesaon_theme', 'dark');
    
    await themeService.toggleTheme();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@mesaon_theme', 'light');
  });

  it('should load persisted theme on initialization', async () => {
    // Mock storage to return 'dark'
    vi.mocked(AsyncStorage.getItem).mockResolvedValue('dark');

    await themeService.loadTheme();

    const theme = themeService.getTheme();
    expect(theme.mode).toBe('dark');
    expect(theme.colors.background).toBe('#121212');
  });
});

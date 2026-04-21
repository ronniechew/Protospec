// Theme Manager for dynamic theme switching
export class ThemeManager {
  constructor() {
    this.themes = {
      light: {
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#f8f5ff',
        '--text-primary': '#171717',
        '--text-secondary': '#4d4d4d',
        '--text-tertiary': '#666666',
        '--border-color': 'rgba(0,0,0,0.08)',
        '--primary-color': '#7C3AED',
        '--primary-color-dark': '#6a32c9',
        '--primary-color-light': '#f8f5ff',
        '--success': '#0a72ef',
        '--warning': '#de1d8d',
        '--error': '#ff5b4f',
        '--link': '#0072f5'
      },
      dark: {
        '--bg-primary': '#171717',
        '--bg-secondary': '#222222',
        '--text-primary': '#ffffff',
        '--text-secondary': '#cccccc',
        '--text-tertiary': '#aaaaaa',
        '--border-color': 'rgba(255,255,255,0.1)',
        '--primary-color': '#8B5CF6',
        '--primary-color-dark': '#7C3AED',
        '--primary-color-light': '#312E47',
        '--success': '#60a5fa',
        '--warning': '#fbbf24',
        '--error': '#f87171',
        '--link': '#93c5fd'
      }
    };
    
    this.currentTheme = 'system';
    this.init();
  }

  // Get system theme preference
  getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // Apply theme variables directly to document
  applyTheme(theme) {
    const root = document.documentElement;
    
    if (theme === 'system') {
      // Remove data-theme attribute for system mode
      root.removeAttribute('data-theme');
      localStorage.removeItem('theme');
      
      // Apply system theme based on OS preference
      const systemTheme = this.getSystemTheme();
      this.applyThemeVariables(systemTheme);
      
      // Listen for system theme changes
      this.setupSystemThemeListener();
    } else {
      // Set data-theme attribute for specific theme
      root.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      
      // Apply specific theme variables
      this.applyThemeVariables(theme);
      
      // Remove system theme listener if it exists
      if (this.systemThemeListener) {
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', this.systemThemeListener);
        this.systemThemeListener = null;
      }
    }
    
    this.currentTheme = theme;
  }

  // Apply CSS variables directly
  applyThemeVariables(theme) {
    const themeVars = this.themes[theme];
    const root = document.documentElement;
    
    Object.entries(themeVars).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }

  // Setup listener for system theme changes
  setupSystemThemeListener() {
    if (this.systemThemeListener) {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', this.systemThemeListener);
    }
    
    this.systemThemeListener = (e) => {
      if (this.currentTheme === 'system') {
        const newSystemTheme = e.matches ? 'dark' : 'light';
        this.applyThemeVariables(newSystemTheme);
      }
    };
    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', this.systemThemeListener);
  }

  // Initialize theme from localStorage or system preference
  init() {
    const storedTheme = localStorage.getItem('theme');
    
    if (storedTheme) {
      this.applyTheme(storedTheme);
    } else {
      this.applyTheme('system');
    }
  }

  // Set theme externally
  setTheme(theme) {
    this.applyTheme(theme);
  }
}

// Create global instance
export const themeManager = new ThemeManager();

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.themeManager = themeManager;
}
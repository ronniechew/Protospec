/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,ts,vue}',
    './pages/**/*.{js,ts,vue}',
    './layouts/**/*.{js,ts,vue}',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        // Define CSS variable-based color system
        // Light theme defaults
        'bg-primary': 'var(--bg-primary, #ffffff)',
        'bg-secondary': 'var(--bg-secondary, #f8f5ff)',
        'text-primary': 'var(--text-primary, #171717)',
        'text-secondary': 'var(--text-secondary, #4d4d4d)',
        'text-tertiary': 'var(--text-tertiary, #666666)',
        'border-color': 'var(--border-color, rgba(0,0,0,0.08))',
        'primary-color': 'var(--primary-color, #7C3AED)',
        'primary-color-dark': 'var(--primary-color-dark, #6a32c9)',
        'primary-color-light': 'var(--primary-color-light, #f8f5ff)',
        'success': 'var(--success, #0a72ef)',
        'warning': 'var(--warning, #de1d8d)',
        'error': 'var(--error, #ff5b4f)',
        'link': 'var(--link, #0072f5)',
        
        // Fallback colors for when CSS vars aren't set
        black: '#171717',
        white: '#ffffff',
        purple: {
          DEFAULT: '#7C3AED',
          dark: '#6a32c9',
          light: '#f8f5ff',
          text: '#5d2ab5'
        },
        primary: 'var(--text-primary, #171717)', // Vercel primary text
        secondary: 'var(--text-secondary, #4d4d4d)', // Vercel secondary text
        tertiary: 'var(--text-tertiary, #666666)', // Vercel tertiary text
        placeholder: 'var(--text-tertiary, #666666)', // Vercel placeholder text
        background: 'var(--bg-primary, #ffffff)',
        text: {
          body: 'var(--text-primary, #171717)',
          heading: 'var(--text-primary, #171717)',
          secondary: 'var(--text-secondary, #4d4d4d)',
          tertiary: 'var(--text-tertiary, #666666)',
          placeholder: 'var(--text-tertiary, #666666)'
        },
        success: 'var(--success, #0a72ef)',
        warning: 'var(--warning, #de1d8d)',
        error: 'var(--error, #ff5b4f)',
        link: 'var(--link, #0072f5)',
        focus: 'hsla(212, 100%, 48%, 1)',
        ring: 'rgba(147, 197, 253, 0.5)'
      },
      fontFamily: {
        // Geist typography system
        sans: ['Geist', 'Arial', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'Roboto Mono', 'Menlo', 'Monaco', 'Liberation Mono', 'DejaVu Sans Mono', 'Courier New', 'monospace']
      },
      fontSize: {
        // Display sizes with negative letter-spacing
        'display-hero': ['48px', { fontWeight: '600', letterSpacing: '-2.88px' }],
        'section-heading': ['40px', { fontWeight: '600', letterSpacing: '-2.4px' }],
        'subheading-large': ['32px', { fontWeight: '600', letterSpacing: '-1.28px' }],
        'card-title': ['24px', { fontWeight: '600', letterSpacing: '-0.96px' }],
        
        // Body text
        'body-large': ['20px', { fontWeight: '400', lineHeight: '1.80' }],
        'body': ['18px', { fontWeight: '400', lineHeight: '1.56' }],
        'body-small': ['16px', { fontWeight: '400', lineHeight: '1.50' }],
        'body-medium': ['16px', { fontWeight: '500', lineHeight: '1.50' }],
        'body-semibold': ['16px', { fontWeight: '600', lineHeight: '1.50', letterSpacing: '-0.32px' }],
        
        // Buttons and links
        'button': ['14px', { fontWeight: '500', lineHeight: '1.43' }],
        'caption': ['12px', { fontWeight: '400', lineHeight: '1.33' }],
        
        // Technical content (LLM prompts/responses)
        'mono-body': ['16px', { fontWeight: '400', lineHeight: '1.50', fontFamily: 'theme(fontFamily.mono)' }],
        'mono-caption': ['13px', { fontWeight: '500', lineHeight: '1.54', fontFamily: 'theme(fontFamily.mono)' }],
        'mono-small': ['12px', { fontWeight: '500', lineHeight: '1.00', fontFamily: 'theme(fontFamily.mono)', textTransform: 'uppercase' }]
      },
      lineHeight: {
        relaxed: '1.625', // for body text
        tight: '1.00',
        snug: '1.17',
        normal: '1.50',
        loose: '1.80'
      },
      borderRadius: {
        // Vercel radius scales
        none: '0px',
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
        pill: '9999px'
      },
      spacing: {
        // Vercel spacing system based on 8px unit
        px: '1px',
        0: '0px',
        0.5: '2px',
        1: '4px',
        1.5: '6px',
        2: '8px',
        2.5: '10px',
        3: '12px',
        3.5: '14px',
        4: '16px',
        8: '32px',
        9: '36px',
        10: '40px'
      },
      boxShadow: {
        // Shadow-as-border configurations (replacing traditional borders)
        'border': '0px 0px 0px 1px rgba(0,0,0,0.08)',
        'elevation': '0px 2px 2px rgba(0,0,0,0.04)',
        'card': 'rgba(0,0,0,0.08) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 2px, rgba(0,0,0,0.04) 0px 8px 8px -8px, #fafafa 0px 0px 0px 1px',
        'focus': '0px 0px 0px 4px rgba(147, 197, 253, 0.5)'
      },
      outline: {
        focus: '2px solid hsla(212, 100%, 48%, 1)'
      }
    }
  },
  plugins: []
}
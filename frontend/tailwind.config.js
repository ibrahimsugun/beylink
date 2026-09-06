/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: '#12C4B0',
          violet: '#6D3BEA',
          'violet-dark': '#5A2FC2',
        },
        ink: '#1B2340',
        'ink-soft': '#2C3556',
        muted: '#6B7392',
        surface: '#F6F8FB',
        card: '#FFFFFF',
        line: '#E5E9F2',
        success: '#12B886',
        warning: '#F5A524',
        danger: '#F04438',
      },
      fontFamily: {
        display: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #12C4B0 0%, #6D3BEA 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, rgba(18,196,176,0.12) 0%, rgba(109,59,234,0.12) 100%)',
      },
      boxShadow: {
        card: '0 1px 2px rgba(27,35,64,0.04), 0 8px 24px rgba(27,35,64,0.06)',
        pop: '0 12px 40px rgba(27,35,64,0.14)',
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Warm slate-based primary instead of cold indigo
        primary: {
          50:  '#f0f4ff',
          100: '#dde6fd',
          200: '#b9ccfb',
          300: '#8aaaf7',
          400: '#6389f2',
          500: '#4a6cf7',  // main accent - slightly warm blue
          600: '#3451d1',
          700: '#2840a8',
          800: '#1e3087',
          900: '#162266',
        },
        // Warm neutrals instead of cold grays
        warm: {
          50:  '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
        darkbg: {
          900: '#0f0f11',
          850: '#141418',
          800: '#1a1a20',
          700: '#222228',
          600: '#2e2e36',
        },
        // Functional accent colors - muted and tasteful
        success: { 
          50: '#f0fdf4', 
          500: '#22c55e', 
          600: '#16a34a',
          950: '#052e16'
        },
        warning: { 
          50: '#fffbeb', 
          500: '#f59e0b', 
          600: '#d97706',
          950: '#1c1001'
        },
        danger: { 
          50: '#fff1f2', 
          500: '#f43f5e', 
          600: '#e11d48',
          950: '#1a0008'
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'sm':      '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'md':      '0 4px 12px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)',
        'lg':      '0 8px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)',
        'card':    '0 1px 4px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.10)',
        'dark-sm': '0 1px 3px rgba(0,0,0,0.25)',
        'dark-md': '0 4px 12px rgba(0,0,0,0.35)',
      },
      borderRadius: {
        'xl':  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
    },
  },
  plugins: [],
}

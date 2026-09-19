/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F5F7F6',
        ink: { DEFAULT: '#15211F', soft: '#3B4A47', muted: '#5B6B67' },
        line: '#DCE3E0',
        chamber: {
          50: '#EEF5F3', 100: '#D5E6E1', 200: '#A9CDC4', 300: '#78AEA2', 400: '#4A8E80',
          500: '#2F7367', 600: '#245B52', 700: '#1D4A43', 800: '#173B36', 900: '#0E2B27',
        },
        brass: { 50: '#FBF5E9', 100: '#F3E8D0', 400: '#C9A257', 500: '#B48A3C', 600: '#96712D', 700: '#755823' },
        danger: { 50: '#FCEEEC', 100: '#F9D8D5', 500: '#B3261E', 700: '#8C1D18' },
        success: { 50: '#EDFAF2', 100: '#C6EFD7', 500: '#1A8A4A', 700: '#14673A' },
        warning: { 50: '#FFF8E6', 100: '#FDE8A8', 500: '#B58A00', 700: '#8C6A00' },
        info: { 50: '#EDF4FD', 100: '#C5DCFA', 500: '#1E6FBB', 700: '#155292' },
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['"Public Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 1px 0 rgba(21,33,31,0.04), 0 8px 24px -12px rgba(21,33,31,0.18)',
      },
    },
  },
  plugins: [],
};

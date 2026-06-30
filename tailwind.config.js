/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1C1B19',
        paper: '#FAF9F6',
        accent: '#2F5D50',
        accentSoft: '#E4EDE9',
        line: '#E3E0D8',
      },
      fontFamily: {
        display: ['"Zen Kaku Gothic New"', 'sans-serif'],
        body: ['"Noto Sans JP"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

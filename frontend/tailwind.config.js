/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { taskly: '#4967ed', canvas: '#e7e7e7' },
      fontFamily: { sans: ['DM Sans', 'Arial', 'sans-serif'] }
    }
  },
  plugins: []
};

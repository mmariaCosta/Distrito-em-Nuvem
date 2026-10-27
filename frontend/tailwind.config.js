/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores baseadas no seu mockup
        brand: {
          light: '#f8fafc',
          dark: '#0f172a',
          accent: '#3b82f6',
        }
      }
    },
  },
  plugins: [],
}
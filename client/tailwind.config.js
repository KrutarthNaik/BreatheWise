/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0284c7', // Primary Ocean Blue
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49',
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // Pure Teal
          600: '#0d9488',
          700: '#0f766e',
        },
        aqi: {
          good: '#10b981',       // Green
          moderate: '#f59e0b',   // Yellow/Amber
          poor: '#f97316',       // Orange
          unhealthy: '#ef4444',  // Red
          severe: '#8b5cf6',     // Purple
          hazardous: '#7f1d1d',  // Maroon/Dark Red
        }
      },
    },
  },
  plugins: [],
}

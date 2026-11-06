import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        halloween: {
          background: '#0f0f0f',
          surface: '#1a1a1a',
          purple: '#7c3aed',
          orange: '#f97316',
          error: '#dc2626',
          success: '#10b981',
        }
      }
    },
  },
  plugins: [],
} satisfies Config

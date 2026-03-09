/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: '#22d3ee',
          green: '#4ade80',
          amber: '#fbbf24',
          red: '#f87171',
        },
      },
      animation: {
        'pulse-fast': 'pulse 0.8s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [],
}

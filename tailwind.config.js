/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0B0B0D',
        redAccent: '#E01E2E',
        slateGray: '#334155',
        // New AppFlowy-style colors
        'purple-brand': '#7F24DD',
        'raspberry': '#FB006D',
        'tuscany': '#FBC06D',
        appBg: 'var(--bg-primary)',
        appBgSoft: 'var(--bg-secondary)',
        appText: 'var(--text-primary)',
        appTextMuted: 'var(--text-secondary)',
        appBorder: 'var(--border-primary)',
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'premium': '0 10px 30px -5px rgba(0, 0, 0, 0.3)',
        'premium-light': '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}

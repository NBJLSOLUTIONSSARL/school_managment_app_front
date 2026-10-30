/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        frappe: {
          bg: '#f8fafc',
          surface: '#ffffff',
          border: '#e2e8f0',
          hover: '#f1f5f9',
          muted: '#64748b',
          dark: '#0f172a'
        }
      },
      fontSize: {
        '2xs': ['11px', '14px'],
        'xs': ['12px', '16px'],
        'sm': ['13px', '18px'],
        'base': ['14px', '20px'],
      },
      borderRadius: {
        DEFAULT: '4px',
        md: '6px',
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }
    }
  },
  plugins: [],
}

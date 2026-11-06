// Tailwind v4 is handled by @tailwindcss/vite plugin in vite.config.js.
// PostCSS only runs autoprefixer for non-Tailwind CSS transformations.
export default {
  plugins: {
    autoprefixer: {},
  },
}

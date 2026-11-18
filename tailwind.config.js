/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tenant: {
          primary: 'var(--tenant-primary, #3B82F6)',
          secondary: 'var(--tenant-secondary, #1E293B)',
          accent: 'var(--tenant-accent, #F59E0B)',
        }
      },
      borderRadius: {
        tenant: 'var(--tenant-radius, 0.75rem)',
      },
      fontFamily: {
        heading: 'var(--tenant-font-heading, "Inter", sans-serif)',
        body: 'var(--tenant-font-body, "Inter", sans-serif)',
      }
    },
  },
  plugins: [],
}

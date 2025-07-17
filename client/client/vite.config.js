import tailwindcss from '@tailwindcss/vite'
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [
    tailwindcss(),
  ],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,ts,vue}',
    './pages/**/*.{js,ts,vue}',
    './layouts/**/*.{js,ts,vue}',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e40af', // deep blue
        secondary: '#d97706', // Malaysian gold
        accent: '#059669', // emerald green
        background: '#f8fafc',
        text: {
          body: '#1e293b',
          heading: '#0f172a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      fontSize: {
        '4xl': ['40px', { fontWeight: '700' }], // H1
        '3xl': ['32px', { fontWeight: '600' }], // H2
        '2xl': ['24px', { fontWeight: '500' }] // H3
      },
      lineHeight: {
        relaxed: '1.625' // for body text
      }
    }
  },
  plugins: []
}
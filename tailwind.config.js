/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    extend: {
      colors: {
        talebot: {
          pink: '#fce4ec', // لون الخلفية الوردي الفاتح
          purple: '#ede7f6', // لون البنفسجي الفاتح
          accent: '#ec4899', // لون الأزرار الوردي الغامق
        }
      }
    },
  },
  plugins: [],
}
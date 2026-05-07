// // /** @type {import('tailwindcss').Config} */
// // export default {
// //   content: [],
// //   theme: {
// //     extend: {},
// //   },
// //   plugins: [],
// // }

// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
//   theme: {
//     extend: {}
//   },
//   plugins: []
// }

import tailwindcssAnimate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        brand: {
          50: '#fdf8f0',
          100: '#faefd9',
          200: '#f4dba8',
          300: '#ecc26d',
          400: '#e4a535',
          500: '#b45309',
          600: '#92400e',
          700: '#78350f',
          800: '#451a03'
        },
        blush: '#f9e4d4',
        dustyteal: '#4a7c7e',
        cream: '#fdf6ee',
        warmgold: '#b45309'
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        display: ['Playfair Display', 'serif']
      }
    }
  },
  plugins: [tailwindcssAnimate]
}

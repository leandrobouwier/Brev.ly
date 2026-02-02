/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-sans)', 'sans-serif'],
            },
            colors: {
                
                brand: {
                    blue: 'var(--color-blue)',          // #2C46B1
                    dark: 'var(--color-blue-dark)',     // #2C4091
                },
                gray: {
                    100: 'var(--color-gray-100)', // #F9F9FB
                    200: 'var(--color-gray-200)', // #E4E6EC
                    300: 'var(--color-gray-300)', // #CDCFD5
                    400: 'var(--color-gray-400)', // #74798B
                    500: 'var(--color-gray-500)', // #4D505C
                    600: 'var(--color-gray-600)', // #1F2025 (Seu texto escuro)
                },
                danger: 'var(--color-danger)',  // #B12C4D
            },
        },
    },
    plugins: [],
}
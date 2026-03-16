/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // We will force dark mode or use class strategy
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0a0a0a", // Very dark background
                card: "#121212",       // Slightly lighter for cards
                primary: "#00e5ff",    // Cyan/Teal accent
                secondary: "#1f1f1f",  // Secondary elements
                text: "#ffffff",
                muted: "#a1a1aa",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}

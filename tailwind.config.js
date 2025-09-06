/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cinech Brand Colors
        'cinech': {
          'red': '#DC2626',      // Ana kırmızı (arı rengi)
          'red-light': '#EF4444', // Açık kırmızı
          'red-dark': '#B91C1C',  // Koyu kırmızı
          'beige': '#F5F5DC',     // Arka plan bej
          'beige-dark': '#E5E5CC', // Koyu bej
          'gold': '#F59E0B',      // Altın sarısı (token rengi)
          'gold-light': '#FCD34D', // Açık altın
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'cinech': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bee-buzz': 'buzz 2s ease-in-out infinite',
        'token-glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        buzz: {
          '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
          '25%': { transform: 'translateX(2px) rotate(1deg)' },
          '75%': { transform: 'translateX(-2px) rotate(-1deg)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #F59E0B' },
          '100%': { boxShadow: '0 0 20px #F59E0B, 0 0 30px #F59E0B' },
        }
      }
    },
  },
  plugins: [],
}

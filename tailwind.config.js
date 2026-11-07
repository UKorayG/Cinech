/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cinech "Zeytin" paleti: sıcak krem zemin, soğuk zeytin yeşili, kahve vurgu
        cinech: {
          olive: '#3C4A32',
          'olive-light': '#52653F',
          'olive-dark': '#2B3624',
          cream: '#EAE4D2',
          'cream-dark': '#DDD4BC',
          paper: '#E4DCC6',
          ink: '#1C2118',
          'ink-light': '#28301F',
          'ink-lighter': '#3A4531',
          brown: '#7A4A24',
          'brown-light': '#9A6333',
          beige: '#EAE4D2',
          'beige-dark': '#DDD4BC',
        },
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        // Tek gövde font ailesi: Archivo. Kesimler globals.css'te font-stretch / font-weight ile ayrılır.
        sans: ['var(--font-archivo)', 'system-ui', 'sans-serif'],
        cinech: ['var(--font-archivo)', 'system-ui', 'sans-serif'],
        display: ['var(--font-archivo)', 'Impact', 'sans-serif'],
        mono: ['var(--font-archivo)', 'system-ui', 'sans-serif'],
        script: ['var(--font-yellowtail)', 'Brush Script MT', 'cursive'],
      },
      boxShadow: {
        hard: '6px 6px 0 0 #1C2118',
        'hard-sm': '3px 3px 0 0 #1C2118',
        'hard-cream': '6px 6px 0 0 #EAE4D2',
        'hard-olive': '6px 6px 0 0 #3C4A32',
        'hard-brown': '6px 6px 0 0 #7A4A24',
      },
      animation: {
        'bee-buzz': 'buzz 2s ease-in-out infinite',
        'token-glow': 'glow 2s ease-in-out infinite alternate',
        flicker: 'flicker 6s ease-in-out infinite',
        'rec-blink': 'recBlink 1.2s steps(1) infinite',
        marquee: 'marquee 40s linear infinite',
      },
      keyframes: {
        buzz: {
          '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
          '25%': { transform: 'translateX(2px) rotate(1deg)' },
          '75%': { transform: 'translateX(-2px) rotate(-1deg)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #7A4A24' },
          '100%': { boxShadow: '0 0 20px #7A4A24, 0 0 30px #7A4A24' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '45%': { opacity: '0.92' },
          '50%': { opacity: '0.98' },
          '55%': { opacity: '0.9' },
        },
        recBlink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.25' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};

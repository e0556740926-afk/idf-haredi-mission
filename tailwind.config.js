/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--canvas)',
        bg: 'var(--bg)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        weak: 'var(--weak)',
        line: 'var(--line)',
        blue: 'var(--blue)',
        soft: 'var(--soft)',
        copper: 'var(--copper)',
        warm: 'var(--warm)',
        green: 'var(--green)',
        alertbar: 'var(--alertbar)',
        aggregateBorder: 'var(--aggregate-border)',
        winBg: 'var(--win-bg)',
        focusRing: 'var(--focus-ring)',
        privateBg: 'var(--private-bg)',
        forecastBtnBg: 'var(--forecast-btn-bg)',
      },
      fontFamily: {
        body: ['Rubik', 'Arial', 'sans-serif'],
        logo: ['Georgia', 'serif'],
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
};

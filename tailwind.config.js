/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAFAF7',
        paperLine: '#DFDAC9',
        ink: '#1B2A4A',
        inkSoft: '#4B5875',
        inkFaint: '#8A93A8',
        redpen: '#C4342B',
        redpenSoft: '#F4DEDB',
        greenpen: '#3F6B4A',
        greenpenSoft: '#DEE8DE',
        amber: '#B9832E',
        amberSoft: '#F1E3CB',
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        grid: 'radial-gradient(circle, #DFDAC9 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '18px 18px',
      },
    },
  },
  plugins: [],
}

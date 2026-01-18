/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Pixel art fonts from Google Fonts
        pixel: ['Press Start 2P', 'system-ui', 'sans-serif'],      // ตัวใหญ่ pixel retro
        pixelMod: ['Pixelify Sans', 'system-ui', 'sans-serif'],    // ตัวปกติ pixel
        retro: ['VT323', 'monospace'],                             // แบบ retro นอสตาลเจีย
      },
      colors: {
        // Pixel art colors
        'pixel-green': '#00FF00',
        'pixel-blue': '#0000FF',
        'pixel-red': '#FF0000',
        'pixel-yellow': '#FFFF00',
        'pixel-cyan': '#00FFFF',
        'pixel-magenta': '#FF00FF',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
    },
  },
  plugins: [],
}

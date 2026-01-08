import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#0D1B2A',
        aqua: '#1CA7EC',
        sand: '#F5F1E3',
        leaf: '#2EC4B6',
      },
    },
  },
  plugins: [],
}
export default config

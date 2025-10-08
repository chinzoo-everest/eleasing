/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './App.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter_400Regular', 'Inter_700Bold'],
      },
      colors: {
        Primary: '#6265FE',
        bgPrimary: '#24292D',
        bgSecondary: '#222630',
        bgLight: '#2B3034',
        tPrimary: '#9CA3AF',
        shadowPrimary: '#51D0E5',
        Secondary: '#00C7EB',
        Tertiary: '#FFDA7E',
        Fourth: '#FF594F',
      },
    },
  },
  plugins: [],
};

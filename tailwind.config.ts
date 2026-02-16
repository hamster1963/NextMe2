import typography from '@tailwindcss/typography'

export default {
  content: ['./app/**/*.{ts,tsx}', './content/**/*.mdx', './public/**/*.svg'],
  theme: {
    extend: {
      animation: {
        shine: 'shine 5s linear infinite',
        shimmer: 'shimmer 6s infinite',
        orbit: 'spin 2s linear forwards infinite',
        orbit2: 'spin 5s linear reverse infinite',
        orbit3: 'spin 7s linear forwards infinite',
        orbit4: 'spin 9s linear reverse infinite',
      },
      keyframes: {
        shimmer: {
          '0%, 90%, 100%': {
            'background-position': 'calc(-100% - var(--shimmer-width)) 0',
          },
          '30%, 60%': {
            'background-position': 'calc(100% + var(--shimmer-width)) 0',
          },
        },
        shine: {
          '0%': {
            'background-position': '-100% top',
          },
          '70%': {
            'background-position': '250% top',
          },
          '100%': {
            'background-position': '250% top',
          },
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      typography: {
        quoteless: {
          css: {
            'blockquote p:first-of-type::before': { content: 'none' },
            'blockquote p:first-of-type::after': { content: 'none' },
          },
        },
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [typography, require('tailwindcss-animate')],
}

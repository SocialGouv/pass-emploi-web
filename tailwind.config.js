/**
 * docs: https://tailwindcss.com/docs/configuration
 *
 * TODO : for production mode : https://tailwindcss.com/docs/optimizing-for-production
 */

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1441px',
    },
    /**
     * Usage
     * - CSS : background-color: theme('colors.violet');
     * - HTML: <p className="text-violet" >
     */
    colors: {
      content_color: '#646464',
      bleu_nuit: '#333866',
      primary_primary: '#333866',
      bleu: '#767BA8',
      blanc: '#FFFFFF',
      bleu_gris: '#9196C0',
      bleu_clair: '#C8CBE4',
      bleu_blanc: '#F4F5FF',
      gris_blanc: '#F6F9FC',
      violet: '#9762DA',
      rose: '#EF5DA8',
      rouge_france: '#E1000F',
      rouge_france_5: '#E1000F0D',
      warning: '#FF3F15',
      primary: '#3B69D1',
      primary_lighten: '#EEF1F8',
      grey_3: '#646667',
      neutral_content: '#161616',
      neutral_grey: '#878787',
    },

    fill: (theme) => ({
      ...theme('colors'),
    }),

    backgroundColor: (theme) => ({
      ...theme('colors'),
    }),

    borderColor: (theme) => ({
      ...theme('colors'),
    }),

    placeholderColor: (theme) => theme('colors'),

    borderRadius: {
      none: '0',
      x_small: '2px',
      small: '5px',
      medium: '8px',
      large: '16px',
      x_large: '24px',
    },
    gridTemplateColumns: {
      // Complex site-specific column configuration
      table: '1fr 2fr',
      table_large: '28% 2fr 3fr auto',
    },
    extend: {
      fontFamily: {
        sans: ['Marianne'],
      },
    },
  },
  plugins: [],
}

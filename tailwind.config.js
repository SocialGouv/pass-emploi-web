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
  safelist: [
    { pattern: /^bg-/ },
    { pattern: /^text-/ },
    { pattern: /^border-/ },
    { pattern: /^fill-/ },
    { pattern: /^w-/ },
    { pattern: /^h-/ },
  ], // Retain all classes starting with...
  theme: {
    /**
     * Usage
     * - CSS : background-color: theme('colors.violet');
     * - HTML: <p className="text-violet" >
     */
    colors: {
      blanc: '#FFFFFF',
      primary: '#3B69D1',
      primary_lighten: '#EEF1F8',
      primary_darken: '#274996',
      success: '#0D7F50',
      success_lighten: '#E5F6EF',
      success_darken: '#033C24',
      warning: '#D33211',
      warning_lighten: '#FFF1ED',
      warning_lighten2: '#FFCBBC',
      alert_lighten: '#FFC6A6',
      accent_1: '#950EFF',
      accent_1_lighten: '#F4E5FF',
      accent_2: '#4A526D',
      accent_2_lighten: '#F6F6F6',
      accent_3: '#0C7A81',
      accent_3_lighten: '#DFFDFF',
      accent_4: '#15616D',
      accent_4_lighten: '#DDFFED',
      accent_5: '#6D597A',
      accent_5_lighten: '#F0EDF2',
      content_color: '#161616',
      grey_800: '#646464',
      grey_700: '#878787',
      grey_500: '#B2B2B2',
      grey_100: '#F1F1F1',
      disabled: '#73758D',
      favorite_heart: '#A44C66',
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

    screenSize: (theme) => theme('screens'),

    borderRadius: {
      none: '0',
      x_small: '2px',
      small: '6px',
      medium: '8px',
      large: '16px',
      x_large: '24px',
      full: '9999px',
    },
    screens: {
      layout_xs: '375px',
      layout_s: '600px',
      layout_base: '900px',
      layout_m: '1024px',
      layout_l: '1200px',
      layout_xl: '1425px',
      // short breakpoint on mobile when keyboard is visible
      short: { raw: '(max-height: 350px)' },
    },

    extend: {
      backgroundImage: {
        // path relative to globals.css
        clock: "url('../assets/icons/clock.svg')",
        location: "url('../assets/icons/location_big.svg')",
      },
      boxShadow: {
        s: '0 6px 25px 0px rgba(0,0,0,0.1)',
      },
      fontFamily: {
        sans: ['Marianne'],
      },
    },
  },
  plugins: [],
}

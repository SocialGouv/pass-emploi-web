/**
 * docs: https://tailwindcss.com/docs/configuration
 *
 * TODO : for production mode : https://tailwindcss.com/docs/optimizing-for-production
 */

module.exports = {
  darkMode: 'false',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    { pattern: /^bg-/ },
    { pattern: /^text-/ },
    { pattern: /^border-/ },
    { pattern: /^fill-/ },
    { pattern: /^(max-)?w-/ },
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
      primary: 'var(--primary)',
      primary_lighten: 'var(--primary-lighten)',
      primary_darken: 'var(--primary-darken)',
      primary_darken_brsa: '#172B5A',
      success: '#0D7F50',
      success_lighten: '#E5F6EF',
      success_darken: '#033C24',
      warning: '#D31140',
      warning_lighten: '#FDEAEF',
      alert: '#FF975C',
      alert_lighten: '#FFC6A6',
      accent_1: '#950EFF',
      accent_1_lighten: '#F4E5FF',
      accent_2: '#4A526D',
      accent_2_lighten: '#F6F6F6',
      accent_3: '#0C7A81',
      accent_3_lighten: '#DFFDFF',
      accent_4: '#6D597A',
      accent_4_lighten: '#F0EDF2',
      additional_1: '#FCBF49',
      additional_1_lighten: '#FFD88D',
      additional_2: '#15616D',
      additional_2_lighten: '#DDFFED',
      additional_3: '#5149A8',
      additional_3_lighten: '#D2CEF6',
      additional_4: '#2186C7',
      additional_4_lighten: '#DBEDF9',
      additional_5: '#49BBBF',
      additional_5_lighten: '#CEF0F1',
      content_color: '#161616',
      grey_100: '#F1F1F1',
      grey_500: '#B2B2B2',
      grey_700: '#878787',
      grey_800: '#646464',
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
      base: '8px',
      l: '24px',
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

    boxShadow: {
      base: '0 4px 12px 0px rgba(39, 73, 150, 0.12)',
      m: '0 8px 12px 0px rgba(39, 73, 150, 0.24)',
      none: 'none',
    },

    extend: {
      backgroundImage: {
        // path relative to globals.css
        clock: "url('../assets/icons/informations/schedule.svg')",
        location: "url('../assets/icons/informations/location_on.svg')",
      },
    },
  },
  plugins: [],
}

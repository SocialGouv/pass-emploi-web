/**
 * docs: https://tailwindcss.com/docs/configuration
 *
 * TODO : for production mode : https://tailwindcss.com/docs/optimizing-for-production
 */

module.exports = {
	purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
	darkMode: false, // or 'media' or 'class'
	theme: {
		screens: {
			//TODO check with UI
			sm: '480px',
			md: '768px',
			lg: '976px',
			xl: '1440px',
		},
		/**
		 * Usage
		 * - CSS : background-color: theme('colors.violet');
		 * - HTML: <p className="text-violet" >
		 */
		colors: {
			bleu_nuit: '#333866',
			bleu_violet: '#767BA8',
			bleu_clair: '#9196C0',
			bleu_gris: '#C8CBE4',
			blanc: '#FFFFFF',
			violet: '#9762DA',
		},
		extend: {},
	},
	variants: {
		extend: {},
	},
	plugins: [],
}

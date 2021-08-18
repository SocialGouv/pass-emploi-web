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
			bleu: '#767BA8',
			blanc: '#FFFFFF',
			bleu_gris: '#9196C0',
			bleu_clair: '#C8CBE4',
			bleu_blanc: '#F4F5FF',
			violet: '#9762DA',
		},
		extend: {
			fontFamily: {
				sans: ['Rubik'],
			},
		},
	},
	variants: {
		extend: {},
	},
	plugins: [],
}

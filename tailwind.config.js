/**
 * docs: https://tailwindcss.com/docs/configuration
 *
 * TODO : for production mode : https://tailwindcss.com/docs/optimizing-for-production
 */

module.exports = {
	mode: 'jit', // Just in Time mode, see: https://tailwindcss.com/docs/just-in-time-mode
	purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
	darkMode: false, // or 'media' or 'class'
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
			bleu_nuit: '#333866',
			bleu: '#767BA8',
			blanc: '#FFFFFF',
			bleu_gris: '#9196C0',
			bleu_clair: '#C8CBE4',
			bleu_blanc: '#F4F5FF',
			gris_blanc: '#F6F9FC',
			violet: '#9762DA',
		},

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

/** @type {import('next').NextConfig} */

module.exports = {
	reactStrictMode: true,

	env: {
		API_ENDPOINT: process.env.API_ENDPOINT,
		FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
		FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
		FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
		FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
		FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
		FIREBASE_MESSAGING_SENDER: process.env.FIREBASE_MESSAGING_SENDER,
		FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
		FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
	},

	i18n: {
		locales: ['fr-FR'],
		defaultLocale: 'fr-FR',
	},
}

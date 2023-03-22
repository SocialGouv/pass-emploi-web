/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({ dest: 'public' })

module.exports = withPWA({
  reactStrictMode: true,

  env: {
    // API
    API_ENDPOINT: process.env.API_ENDPOINT,
    // AUTH
    AUTH_SECRET: process.env.AUTH_SECRET,
    ENABLE_PASS_EMPLOI_SSO: process.env.ENABLE_PASS_EMPLOI_SSO === 'true',
    KEYCLOAK_ID: process.env.KEYCLOAK_ID,
    KEYCLOAK_SECRET: process.env.KEYCLOAK_SECRET,
    KEYCLOAK_ISSUER: process.env.KEYCLOAK_ISSUER,
    // FIREBASE
    FIREBASE_CHAT_COLLECTION_NAME: process.env.FIREBASE_CHAT_COLLECTION_NAME,
    FIREBASE_GROUPE_COLLECTION_NAME:
      process.env.FIREBASE_GROUPE_COLLECTION_NAME,
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER: process.env.FIREBASE_MESSAGING_SENDER,
    FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
    // APM
    APP: process.env.APP,
    APM_URL: process.env.APM_URL,
    APM_IS_ACTIVE: process.env.APM_IS_ACTIVE,
    // OTHER
    ENVIRONMENT: process.env.ENVIRONMENT,
    MATOMO_SOCIALGOUV_URL: process.env.MATOMO_SOCIALGOUV_URL,
    MATOMO_SOCIALGOUV_SITE_ID: process.env.MATOMO_SOCIALGOUV_SITE_ID,
    FAQ_MILO_EXTERNAL_LINK: process.env.FAQ_MILO_EXTERNAL_LINK,
    FAQ_PE_EXTERNAL_LINK: process.env.FAQ_PE_EXTERNAL_LINK,
    SUPPORT_MAIL: process.env.SUPPORT_MAIL,
  },

  async redirects() {
    return [
      {
        source: '/index',
        destination: '/',
        permanent: true,
      },
    ]
  },

  i18n: {
    locales: ['fr-FR'],
    defaultLocale: 'fr-FR',
  },

  compiler: {
    // https://nextjs.org/docs/advanced-features/compiler#remove-react-properties
    reactRemoveProperties: true,
  },
  webpack(config) {
    // https://react-svgr.com/docs/next/
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [{ loader: '@svgr/webpack', options: { titleProp: true } }],
    })

    // https://www.elastic.co/guide/en/apm/agent/rum-js/current/install-the-agent.html#using-bundlers
    const { EnvironmentPlugin } = require('webpack')
    config.plugins.push(
      new EnvironmentPlugin({
        NODE_ENV: 'production',
      })
    )

    return config
  },
})

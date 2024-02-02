/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  defaultSizes: 'gzip',
  openAnalyzer: false,
})

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  swcMinify: true,
  productionBrowserSourceMaps: true,

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

  rewrites: async () => ({
    beforeFiles: [
      {
        source: '/etablissement/beneficiaires/:path*',
        destination: '/mes-jeunes/:path*',
      },
    ],
  }),

  compiler: {
    // https://nextjs.org/docs/advanced-features/compiler#remove-react-properties
    reactRemoveProperties: true,
  },

  webpack(config) {
    // https://react-svgr.com/docs/next/
    config.module.rules.push({
      test: /\.svg$/i,
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

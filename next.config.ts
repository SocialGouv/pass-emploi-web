import { NextConfig } from 'next'

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  defaultSizes: 'gzip',
  openAnalyzer: false,
})

const nextConfig: NextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true,

  env: {
    APP: process.env.APP, // NEXT_PUBLIC_APP=$APP not working client side
  },

  async redirects() {
    return [
      {
        source: '/index',
        destination: '/',
        permanent: true,
      },
      { source: '/login/cej', destination: '/login', permanent: true },
      { source: '/login/passemploi', destination: '/login', permanent: true },
      {
        source: '/mes-jeunes/milo',
        destination: '/mes-jeunes',
        permanent: true,
      },
      {
        source: '/mes-jeunes/pole-emploi',
        destination: '/mes-jeunes',
        permanent: true,
      },
      {
        source: '/mes-jeunes/:idJeune/actions',
        destination: '/mes-jeunes/:idJeune?onglet=actions',
        permanent: true,
      },
      {
        source: '/mes-jeunes/milo/:numeroDossier',
        destination: '/api/milo/:numeroDossier',
        permanent: true,
      },
      { source: '/recherche-offres', destination: '/offres', permanent: true },
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
    afterFiles: [],
    fallback: [],
  }),

  compiler: {
    // https://nextjs.org/docs/advanced-features/compiler#remove-react-properties
    reactRemoveProperties: true,
  },

  webpack(config: any) {
    // https://react-svgr.com/docs/next/
    config.module.rules.push({
      test: /\.svg$/i,
      use: [{ loader: '@svgr/webpack', options: { titleProp: true } }],
    })

    // https://www.elastic.co/guide/en/apm/agent/rum-js/current/install-the-agent.html#using-bundlers
    const { EnvironmentPlugin } = require('webpack')
    config.plugins.push(
      new EnvironmentPlugin({
        NODE_ENV: process.env.NODE_ENV,
      })
    )

    return config
  },
}

export default withBundleAnalyzer(nextConfig)

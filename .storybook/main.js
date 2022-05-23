const path = require('path')
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin')

module.exports = {
  stories: ['../**/*.stories.mdx', '../**/**/*.stories.@(ts|tsx|mdx)'],
  staticDirs: ['../public', '../assets'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    {
      /**
       * Fix Storybook issue with PostCSS@8
       * @see https://github.com/storybookjs/storybook/issues/12668#issuecomment-773958085
       */
      name: '@storybook/addon-postcss',
      options: {
        postcssLoaderOptions: {
          implementation: require('postcss'),
        },
      },
    },
  ],
  babel: (options) => ({
    ...options,
  }),
  typescript: {
    reactDocgen: false,
  },
  core: {
    builder: 'webpack5',
  },
  webpackFinal: (config) => {
    config.resolve.plugins = [
      new TsconfigPathsPlugin({ extensions: config.resolve.extensions }),
    ]

    config.resolve.roots = [
      path.resolve(__dirname, '../public'),
      'node_modules',
    ]

    // Default rule for images /\.(svg|ico|jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\?.*)?$/
    const fileLoaderRule = config.module.rules.find(
      (rule) => rule.test && rule.test.test('.svg')
    )
    fileLoaderRule.exclude = /\.svg$/

    config.module.rules.push({
      test: /\.svg$/,
      enforce: 'pre',
      loader: require.resolve('@svgr/webpack'),
    })

    return config
  },
}

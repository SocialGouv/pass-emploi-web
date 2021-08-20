import 'styles/globals.css'
import 'styles/typography.css'

import type { AppProps } from 'next/app'

import Layout from 'components/layouts/Layout'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps}/>
    </Layout>
  )
}
export default MyApp

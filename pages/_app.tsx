import ProgressBar from '@badrap/bar-of-progress'

import Router, { useRouter } from 'next/router'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'

import Layout from 'components/layouts/Layout'

import { init } from '@socialgouv/matomo-next'

const MATOMO_URL = process.env.MATOMO_SOCIALGOUV_URL || ''
const MATOMO_SITE_ID = process.env.MATOMO_SOCIALGOUV_SITE_ID || ''

import 'styles/globals.css'
import 'styles/typography.css'

const progress = new ProgressBar({
  size: 5,
  color: '#9196C0',
  className: 'bar-of-progress',
  delay: 100,
})

Router.events.on('routeChangeStart', progress.start)
Router.events.on('routeChangeComplete', progress.finish)
Router.events.on('routeChangeError', progress.finish)

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const isLoginPage = router.pathname === '/login'

  useEffect(() => {
    init({ url: MATOMO_URL, siteId: MATOMO_SITE_ID })
  }, [])

  return (
    <>
      {isLoginPage ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </>
  )
}
export default MyApp

import ProgressBar from '@badrap/bar-of-progress'
import init from '@socialgouv/matomo-next'
import Layout from 'components/layouts/Layout'
import { AppProps } from 'next/app'
import Router, { useRouter } from 'next/router'
import React, { ReactNode, useEffect } from 'react'
import 'styles/globals.css'
import 'styles/typography.css'
import { DIProvider } from 'utils/injectionDependances'

const MATOMO_URL = process.env.MATOMO_SOCIALGOUV_URL || ''
const MATOMO_SITE_ID = process.env.MATOMO_SOCIALGOUV_SITE_ID || ''

const progress = new ProgressBar({
  size: 5,
  color: '#9196C0',
  className: 'bar-of-progress',
  delay: 100
})

Router.events.on('routeChangeStart', progress.start)
Router.events.on('routeChangeComplete', progress.finish)
Router.events.on('routeChangeError', progress.finish)

function MyApp ({ Component, pageProps }: AppProps): ReactNode {
  const router = useRouter()
  const isLoginPage = router.pathname === '/login'

  useEffect(() => {
    init({ url: MATOMO_URL, siteId: MATOMO_SITE_ID })
  }, [])

  return (
    <DIProvider>
      {isLoginPage ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </DIProvider>
  )
}

export default MyApp

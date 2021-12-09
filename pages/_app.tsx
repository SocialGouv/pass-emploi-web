import ProgressBar from '@badrap/bar-of-progress'

import Layout from 'components/layouts/Layout'
import { SessionProvider } from 'next-auth/react'

import { AppProps } from 'next/app'
import Router, { useRouter } from 'next/router'
import React, { ReactNode, useEffect } from 'react'

import 'styles/globals.css'
import 'styles/typography.css'
import { DIProvider } from 'utils/injectionDependances'

const progress = new ProgressBar({
  size: 5,
  color: '#9196C0',
  className: 'bar-of-progress',
  delay: 100,
})

Router.events.on('routeChangeStart', progress.start)
Router.events.on('routeChangeComplete', progress.finish)
Router.events.on('routeChangeError', progress.finish)

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps): ReactNode {
  const router = useRouter()
  const isLoginPage = router.pathname === '/login'
  const isLogoutPage = router.pathname === '/logout'

  return (
    <SessionProvider session={session}>
      <DIProvider>
        {isLoginPage || isLogoutPage ? (
          <Component {...pageProps} />
        ) : (
          <Layout>
            <Component {...pageProps} />
          </Layout>
        )}
      </DIProvider>
    </SessionProvider>
  )
}

export default MyApp

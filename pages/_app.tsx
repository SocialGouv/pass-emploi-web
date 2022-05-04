import ProgressBar from '@badrap/bar-of-progress'
import { SessionProvider } from 'next-auth/react'
import { AppProps } from 'next/app'
import Router, { useRouter } from 'next/router'
import React, { ReactNode, useEffect } from 'react'

import { Footer } from 'components/Footer'
import Layout from 'components/layouts/Layout'
import 'styles/globals.css'
import 'styles/typography.css'
import { init } from 'utils/analytics/matomo'
import { ChatCredsProvider } from 'utils/chat/chatCredsContext'
import { CurrentJeuneProvider } from 'utils/chat/currentJeuneContext'
import { Container, DIProvider } from 'utils/injectionDependances'
import { initRum } from 'utils/monitoring/init-rum'

const MATOMO_URL = process.env.MATOMO_SOCIALGOUV_URL || ''
const MATOMO_SITE_ID = process.env.MATOMO_SOCIALGOUV_SITE_ID || ''

const progress = new ProgressBar({
  size: 5,
  color: '#9196C0',
  className: 'bar-of-progress',
  delay: 100,
})

Router.events.on('routeChangeStart', progress.start)
Router.events.on('routeChangeComplete', progress.finish)
Router.events.on('routeChangeError', progress.finish)

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps): ReactNode {
  const router = useRouter()
  const isLoginPage = router.pathname === '/login'
  const isLogoutPage = router.pathname === '/logout'

  useEffect(() => {
    init({ url: MATOMO_URL, siteId: MATOMO_SITE_ID })
    initRum()
  }, [])

  return (
    <SessionProvider session={session}>
      <DIProvider dependances={Container.getDIContainer().dependances}>
        {isLoginPage || isLogoutPage ? (
          <div className='flex flex-col justify-center h-screen'>
            <Component {...pageProps} />
            {isLoginPage && <Footer />}
          </div>
        ) : (
          <ChatCredsProvider>
            <CurrentJeuneProvider>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </CurrentJeuneProvider>
          </ChatCredsProvider>
        )}
      </DIProvider>
    </SessionProvider>
  )
}

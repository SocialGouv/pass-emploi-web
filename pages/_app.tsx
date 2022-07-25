import ProgressBar from '@badrap/bar-of-progress'
import { AppProps as NextAppProps } from 'next/app'
import Router, { useRouter } from 'next/router'
import React, { useEffect } from 'react'

import Footer from 'components/layouts/Footer'
import Layout from 'components/layouts/Layout'
import 'styles/globals.css'
import 'styles/typography.css'
import { init } from 'utils/analytics/matomo'
import { ChatCredentialsProvider } from 'utils/chat/chatCredentialsContext'
import { CurrentJeuneProvider } from 'utils/chat/currentJeuneContext'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'
import { Container, DIProvider } from 'utils/injectionDependances'
import { initRum } from 'utils/monitoring/init-rum'

const MATOMO_URL = process.env.MATOMO_SOCIALGOUV_URL || ''
const MATOMO_SITE_ID = process.env.MATOMO_SOCIALGOUV_SITE_ID || ''

const progress = new ProgressBar({
  size: 5,
  color: '#274996',
  className: 'bar-of-progress',
  delay: 100,
})

Router.events.on('routeChangeStart', progress.start)
Router.events.on('routeChangeComplete', progress.finish)
Router.events.on('routeChangeError', progress.finish)

export default function CustomApp({ Component, pageProps }: NextAppProps) {
  const router = useRouter()
  const isLoginPage = router.pathname === '/login'
  const isLogoutPage = router.pathname === '/logout'

  useEffect(() => {
    init({ url: MATOMO_URL, siteId: MATOMO_SITE_ID })
    initRum()
  }, [])

  return (
    <>
      <DIProvider dependances={Container.getDIContainer().dependances}>
        <ConseillerProvider>
          {isLoginPage || isLogoutPage ? (
            <div className='flex flex-col justify-center h-screen'>
              <Component {...pageProps} />
              {isLoginPage && <Footer />}
            </div>
          ) : (
            <ChatCredentialsProvider>
              <CurrentJeuneProvider>
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              </CurrentJeuneProvider>
            </ChatCredentialsProvider>
          )}
        </ConseillerProvider>
      </DIProvider>
    </>
  )
}

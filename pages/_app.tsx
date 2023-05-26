// eslint import/order: 0
import ProgressBar from '@badrap/bar-of-progress'
import localFont from '@next/font/local'
import type { NextWebVitalsMetric } from 'next/app'
import { AppProps as NextAppProps } from 'next/app'
import Router, { useRouter } from 'next/router'
import { ThemeProvider } from 'next-themes'
import React, { useEffect } from 'react'

// /!\ Garder les imports du CSS au début
import 'styles/globals.css'
import 'styles/typography.css'

import AppHead from 'components/AppHead'
import Footer from 'components/layouts/Footer'
import Layout from 'components/layouts/Layout'
import { AlerteProvider } from 'utils/alerteContext'
import { init } from 'utils/analytics/matomo'
import { ChatCredentialsProvider } from 'utils/chat/chatCredentialsContext'
import { CurrentJeuneProvider } from 'utils/chat/currentJeuneContext'
import { ConseillerProvider } from 'utils/conseiller/conseillerContext'
import { Container, DIProvider } from 'utils/injectionDependances'
import { initRum } from 'utils/monitoring/init-rum'
import { PortefeuilleProvider } from 'utils/portefeuilleContext'

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

export const fontMarianne = localFont({
  src: [
    {
      path: '../assets/fonts/Marianne/static/Marianne-Regular.woff2',
      weight: '400',
    },
    {
      path: '../assets/fonts/Marianne/static/Marianne-Medium.woff2',
      weight: '500',
    },
    {
      path: '../assets/fonts/Marianne/static/Marianne-Bold.woff2',
      weight: '700',
    },
  ],
  fallback: ['arial'],
})

export function reportWebVitals(metric: NextWebVitalsMetric) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('>>>', metric)
  }
}

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
      <style jsx global>{`
        html {
          font-family: ${fontMarianne.style.fontFamily};
        }
      `}</style>
      <DIProvider dependances={Container.getDIContainer().dependances}>
        <ConseillerProvider>
          {isLoginPage || isLogoutPage ? (
            <>
              <AppHead titre='' hasMessageNonLu={false} />
              <div className='flex flex-col justify-center h-screen'>
                <Component {...pageProps} />
                {isLoginPage && <Footer />}
              </div>
            </>
          ) : (
            <PortefeuilleProvider>
              <ChatCredentialsProvider>
                <CurrentJeuneProvider>
                  <AlerteProvider>
                    <ThemeProvider>
                      <Layout>
                        <Component {...pageProps} />
                      </Layout>
                    </ThemeProvider>
                  </AlerteProvider>
                </CurrentJeuneProvider>
              </ChatCredentialsProvider>
            </PortefeuilleProvider>
          )}
        </ConseillerProvider>
      </DIProvider>
    </>
  )
}

// eslint import/order: 0
import ProgressBar from '@badrap/bar-of-progress'
import localFont from '@next/font/local'
import { AppProps as NextAppProps } from 'next/app'
import type { NextWebVitalsMetric } from 'next/app'
import dynamic from 'next/dynamic'
import Router, { useRouter } from 'next/router'
import React, { useEffect } from 'react'

// /!\ Garder les imports du CSS au début
import 'styles/globals.css'
import 'styles/typography.css'

import AppHead from 'components/AppHead'
import Footer from 'components/layouts/Footer'
import { init } from 'utils/analytics/matomo'
import { initRum } from 'utils/monitoring/init-rum'

const ContextProviders = dynamic(import('utils/ContextProviders'), {
  ssr: false,
})

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
  const isOfflinePage =
    router.pathname === '/offline' || router.pathname === '/_offline'
  const shouldUseLayout = !isLoginPage && !isLogoutPage && !isOfflinePage

  useEffect(() => {
    init({ url: MATOMO_URL, siteId: MATOMO_SITE_ID })
    initRum()
  }, [])

  // Clear le SW (retrait de next-pwa) - 05/06/2023
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          registrations.forEach((registration) => registration.unregister())
        })
        .catch(function (err) {
          console.log('Service Worker registration failed: ', err)
        })
    }
  }, [])

  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${fontMarianne.style.fontFamily};
        }
      `}</style>

      {!shouldUseLayout && (
        <>
          <AppHead titre='' hasMessageNonLu={false} />
          <div className='flex flex-col justify-center h-screen'>
            <Component {...pageProps} />
            {isLoginPage && <Footer />}
          </div>
        </>
      )}

      {shouldUseLayout && (
        <ContextProviders>
          <Component {...pageProps} />
        </ContextProviders>
      )}
    </>
  )
}

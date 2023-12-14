// eslint import/order: 0
import type { NextWebVitalsMetric } from 'next/app'
import { AppProps as NextAppProps } from 'next/app'
import dynamic from 'next/dynamic'
import localFont from 'next/font/local'
import React, { useEffect } from 'react'

// /!\ Garder les imports du CSS au début
import 'styles/globals.css'
import 'styles/typography.css'

import ProgressBar from 'components/global/ProgressBar'
import { init } from 'utils/analytics/matomo'
import { initRum } from 'utils/monitoring/elastic'

const ContextProviders = dynamic(import('utils/ContextProviders'), {
  ssr: false,
})

const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_SOCIALGOUV_URL || ''
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SOCIALGOUV_SITE_ID || ''

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
  useEffect(() => {
    init({ url: MATOMO_URL, siteId: MATOMO_SITE_ID })
    initRum()
  }, [])

  // Clear le SW (retrait de next-pwa) - 05/06/2023
  // todo : à retirer dans quelques mois
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

      <ProgressBar />

      <ContextProviders>
        <Component {...pageProps} />
      </ContextProviders>
    </>
  )
}

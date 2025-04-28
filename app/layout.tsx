import { Settings } from 'luxon'
import { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { ReactNode } from 'react'

import Analytics from 'components/global/Analytics'
import DateSettings from 'components/global/DateSettings'
import ProgressBar from 'components/global/ProgressBar'
import RealUserMonitoring from 'components/global/RealUserMonitoring'
import WebVitals from 'components/global/WebVitals'

import 'styles/globals.css'
import 'styles/typography.css'

const marianne = localFont({
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

export const metadata: Metadata = {
  title: 'Espace conseiller',
  description: 'Espace conseiller de l’outil du Contrat d’Engagement Jeune',
  applicationName: 'CEJ conseiller',
  icons: {
    icon: '/cej-favicon.png',
    shortcut: '/cej-favicon.png',
    apple: '/cej-favicon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#3B69D1',
}

Settings.throwOnInvalid = true

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='fr' className={marianne.className}>
      <body>
        <ProgressBar />
        <Analytics />
        <RealUserMonitoring />
        <WebVitals />
        <DateSettings />
        {children}
      </body>
    </html>
  )
}

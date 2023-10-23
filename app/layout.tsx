import { Metadata } from 'next'
import localFont from 'next/font/local'

import Analytics from 'components/global/Analytics'
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
  title: {
    template: '%s - Espace conseiller CEJ',
    default: 'Espace conseiller CEJ',
  },
  description: 'Espace conseiller de l’outil du Contrat d’Engagement Jeune',
  applicationName: 'CEJ conseiller',
  themeColor: '#3B69D1',
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='fr' className={marianne.className}>
      <body>
        <ProgressBar />

        <Analytics />
        <RealUserMonitoring />
        <WebVitals />

        {children}
      </body>
    </html>
  )
}

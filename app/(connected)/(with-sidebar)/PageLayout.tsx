'use client'

import { ReactNode } from 'react'

import layout from 'app/(connected)/(with-sidebar)/PageLayout.module.css'
import { ID_CONTENU } from 'components/globals'
import AlerteDisplayer from 'components/layouts/AlerteDisplayer'
import Footer from 'components/layouts/Footer'
import Header from 'components/layouts/Header'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

export default function PageLayout({
  fullWidth,
  children,
}: {
  fullWidth: boolean
  children: ReactNode
}) {
  const [conseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()

  return (
    <div className={layout.page}>
      <Header />

      <main
        role='main'
        id={ID_CONTENU}
        tabIndex={-1}
        className={`${layout.content} ${
          fullWidth ? layout.content_fullWidth : layout.content_centered
        }`}
      >
        <AlerteDisplayer />
        {children}
      </main>

      <Footer
        conseiller={conseiller}
        aDesBeneficiaires={portefeuille.length > 0}
      />
    </div>
  )
}

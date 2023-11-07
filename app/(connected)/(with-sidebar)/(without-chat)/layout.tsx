'use client'

import { ReactNode } from 'react'

import template from './layout.module.css'

import AlerteDisplayer from 'components/layouts/AlerteDisplayer'
import Footer from 'components/layouts/Footer'
import Header from 'components/layouts/Header'
import { useConseiller } from 'utils/conseiller/conseillerContext'

export default function LayoutWithoutChat({
  children,
}: {
  children: ReactNode
}) {
  const [conseiller] = useConseiller()

  return (
    <div className={template.page}>
      <Header />

      <div className={template.content}>
        <AlerteDisplayer />
        {children}
      </div>

      <Footer conseiller={conseiller} />
    </div>
  )
}

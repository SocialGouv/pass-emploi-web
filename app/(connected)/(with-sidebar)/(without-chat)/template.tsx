'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

import template from './template.module.css'

import AlerteDisplayer from 'components/layouts/AlerteDisplayer'
import Footer from 'components/layouts/Footer'
import Header from 'components/layouts/Header'
import { useConseiller } from 'utils/conseiller/conseillerContext'

export default function LayoutWithoutChat({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()
  const [conseiller] = useConseiller()

  return (
    <div className={template.page}>
      <Header currentPath={pathname!} />

      <div className={template.content}>
        <AlerteDisplayer />
        {children}
      </div>

      <Footer conseiller={conseiller} />
    </div>
  )
}

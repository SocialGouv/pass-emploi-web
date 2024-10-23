'use client'

import React, { ReactNode } from 'react'

import sidebarLayout from 'app/(connected)/(with-sidebar)/sidebar.module.css'
import layout from 'app/(connected)/messagerie/layout.module.css'
import ChatContainer from 'components/chat/ChatContainer'
import { ID_CONTENU } from 'components/globals'
import Footer from 'components/layouts/Footer'
import Sidebar from 'components/Sidebar'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

export default function LayoutPageMessagerie({
  children,
}: {
  children: ReactNode
}) {
  const [conseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()

  return (
    <div className='flex h-screen supports-[height:100dvh]:h-dvh w-screen'>
      <div className={sidebarLayout.sidebar}>
        <Sidebar />
      </div>

      <div id={ID_CONTENU} className={layout.chatRoom} tabIndex={-1}>
        <ChatContainer onShowMenu={() => {}} messagerieFullScreen={true} />
      </div>

      <div className='flex flex-col min-h-0 w-[100vw] layout_s:w-[70vw] layout_l:w-[61vw]'>
        {children}
        <Footer
          conseiller={{ structure: conseiller.structure }}
          aDesBeneficiaires={portefeuille.length > 0}
        />
      </div>
    </div>
  )
}

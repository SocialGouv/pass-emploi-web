'use client'

import React, { ReactNode } from 'react'

import layout from 'app/(connected)/messagerie/layout.module.css'
import ChatContainer from 'components/chat/ChatContainer'
import { ID_CONTENU } from 'components/globals'
import Footer from 'components/layouts/Footer'
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
    <>
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
    </>
  )
}

'use client'

import React, { ReactNode } from 'react'

import sidebarLayout from 'app/(connected)/(with-sidebar)/sidebar.module.css'
import layout from 'app/(connected)/messagerie/layout.module.css'
import ChatContainer from 'components/chat/ChatContainer'
import { ID_CONTENU } from 'components/ids'
import Footer from 'components/layouts/Footer'
import Sidebar from 'components/Sidebar'
import { useChats } from 'utils/chat/chatsContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'

export default function LayoutPageMessagerie({
  children,
}: {
  children: ReactNode
}) {
  const [conseiller] = useConseiller()
  const chats = useChats()

  return (
    <div className='flex h-dvh w-screen'>
      <div className={sidebarLayout.sidebar}>
        <Sidebar />
      </div>

      <div id={ID_CONTENU} className={layout.chatRoom}>
        <ChatContainer
          jeunesChats={chats}
          menuState={[false, () => {}]}
          messagerieFullScreen={true}
        />
      </div>

      <div className='flex flex-col min-h-0 w-[100vw] layout_s:w-[70vw] layout_l:w-[61vw]'>
        {children}
        <Footer conseiller={conseiller} />
      </div>
    </div>
  )
}

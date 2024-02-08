'use client'

import React, { ReactNode } from 'react'

import layout from 'app/(connected)/(with-sidebar)/messagerie/layout.module.css'
import sidebarLayout from 'app/(connected)/(with-sidebar)/sidebar.module.css'
import ChatContainer from 'components/chat/ChatContainer'
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
    <div className='flex h-[100dvh] w-[100vw]'>
      <div className={sidebarLayout.sidebar}>
        <Sidebar />
      </div>

      <div className={layout.chatRoom}>
        <ChatContainer
          jeunesChats={chats}
          menuState={[false, () => {}]}
          messagerieFullScreen={true}
        />
      </div>

      <div className='grow flex flex-col min-h-0'>
        {children}
        <Footer conseiller={conseiller} />
      </div>
    </div>
  )
}

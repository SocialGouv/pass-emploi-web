'use client'

import React, { ReactNode, useState } from 'react'

import layout from 'app/(connected)/(with-sidebar)/(with-chat)/layout.module.css'
import PageLayout from 'app/(connected)/(with-sidebar)/PageLayout'
import sidebarLayout from 'app/(connected)/(with-sidebar)/sidebar.module.css'
import ChatContainer from 'components/chat/ChatContainer'
import ChatNav from 'components/chat/ChatNav'
import { ID_CHAT } from 'components/globals'
import Sidebar from 'components/Sidebar'
import { utiliseChat } from 'interfaces/conseiller'
import { useConseiller } from 'utils/conseiller/conseillerContext'

export default function LayoutWithChat({ children }: { children: ReactNode }) {
  const [conseiller] = useConseiller()
  const [showChatNav, setShowChatNav] = useState<boolean>(false)

  return (
    <div className='flex h-screen supports-[height:100dvh]:h-dvh w-screen'>
      <div className={sidebarLayout.sidebar}>
        <Sidebar />
      </div>

      <PageLayout fullWidth={true}>{children}</PageLayout>

      {utiliseChat(conseiller) && (
        <aside id={ID_CHAT} tabIndex={-1} className={layout.chatRoom}>
          <ChatContainer menuState={[showChatNav, setShowChatNav]} />
        </aside>
      )}

      {showChatNav && <ChatNav onClose={() => setShowChatNav(false)} />}
    </div>
  )
}

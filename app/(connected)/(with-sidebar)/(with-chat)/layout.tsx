'use client'

import React, { ReactNode, useState } from 'react'

import layout from 'app/(connected)/(with-sidebar)/(with-chat)/layout.module.css'
import PageLayout from 'app/(connected)/(with-sidebar)/PageLayout'
import sidebarLayout from 'app/(connected)/(with-sidebar)/sidebar.module.css'
import ChatContainer from 'components/chat/ChatContainer'
import ChatNav from 'components/chat/ChatNav'
import Sidebar from 'components/Sidebar'
import { useChats } from 'utils/chat/chatsContext'

export default function LayoutWithChat({ children }: { children: ReactNode }) {
  const chats = useChats()
  const [showChatNav, setShowChatNav] = useState<boolean>(false)

  return (
    <div className='flex h-[100dvh] w-[100vw]'>
      <div className={sidebarLayout.sidebar}>
        <Sidebar />
      </div>

      <PageLayout fullWidth={true}>{children}</PageLayout>

      <aside className={layout.chatRoom}>
        <ChatContainer
          jeunesChats={chats}
          menuState={[showChatNav, setShowChatNav]}
        />
      </aside>

      {showChatNav && <ChatNav menuState={[showChatNav, setShowChatNav]} />}
    </div>
  )
}

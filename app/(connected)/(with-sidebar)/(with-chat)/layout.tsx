'use client'

import React, { ReactNode, useState } from 'react'

import layout from 'app/(connected)/(with-sidebar)/(with-chat)/layout.module.css'
import PageLayout from 'app/(connected)/(with-sidebar)/PageLayout'
import ChatContainer from 'components/chat/ChatContainer'
import ChatNav from 'components/chat/ChatNav'
import { ID_CHAT } from 'components/globals'
import { utiliseChat } from 'interfaces/conseiller'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useMobileViewport } from 'utils/mobileViewportContext'

export default function LayoutWithChat({ children }: { children: ReactNode }) {
  const [conseiller] = useConseiller()
  const [showChatNav, setShowChatNav] = useState<boolean>(false)
  const isMobileViewport = useMobileViewport()

  return (
    <>
      {!isMobileViewport && (
        <PageLayout fullWidth={true}>{children}</PageLayout>
      )}

      {utiliseChat(conseiller) && (
        <aside id={ID_CHAT} tabIndex={-1} className={layout.chatRoom}>
          <ChatContainer onShowMenu={() => setShowChatNav(true)} />
        </aside>
      )}

      {showChatNav && <ChatNav onClose={() => setShowChatNav(false)} />}
    </>
  )
}

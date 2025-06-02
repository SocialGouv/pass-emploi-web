'use client'

import React, { ReactNode, useState } from 'react'

import layout from 'app/(connected)/(with-sidebar)/(with-chat)/layout.module.css'
import PageLayout from 'app/(connected)/(with-sidebar)/PageLayout'
import ChatContainer from 'components/chat/ChatContainer'
import ChatNav from 'components/chat/ChatNav'
import { ID_CHAT } from 'components/globals'
import Button from 'components/ui/Button/Button'
import { utiliseChat } from 'interfaces/conseiller'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useMobileViewport } from 'utils/mobileViewportContext'

import IconComponent, {
  IconName,
} from '../../../../components/ui/IconComponent'

export default function LayoutWithChat({ children }: { children: ReactNode }) {
  const [conseiller] = useConseiller()
  const [showChatNav, setShowChatNav] = useState<boolean>(false)
  const [showChatContainer, setShowChatContainer] = useState<boolean>(true)
  const isMobileViewport = useMobileViewport()

  function switchChatContainerDisplay() {
    setShowChatContainer(!showChatContainer)
  }

  return (
    <>
      {!isMobileViewport && (
        <PageLayout fullWidth={true}>{children}</PageLayout>
      )}

      {utiliseChat(conseiller) && (
        <aside id={ID_CHAT} tabIndex={-1} className={layout.chatRoom}>
          <Button onClick={switchChatContainerDisplay} className='p-2 mx-auto'>
            <IconComponent
              name={
                showChatContainer ? IconName.ChevronRight : IconName.ChevronLeft
              }
              focusable={false}
              role='img'
              className='w-6 h-6 fill-white rounded-full bg-primary mx-auto inline-block'
            />
            <span className='ml-2'>{showChatContainer ? 'Fermer' : ''}</span>
          </Button>

          {showChatContainer && (
            <ChatContainer onShowMenu={() => setShowChatContainer(true)} />
          )}
        </aside>
      )}

      {showChatNav && <ChatNav onClose={() => setShowChatNav(false)} />}
    </>
  )
}

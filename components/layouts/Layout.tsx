/**
 * Shared Layout, see: https://nextjs.org/docs/basic-features/layouts
 */

import styles from 'styles/components/Layouts.module.css'
import ChatRoom from './ChatRoom'

import Sidebar from './Sidebar'
import { Footer } from 'components/Footer'
import React from 'react'

type LayoutProps = {
  pathname: string
  children: any
}

export default function Layout({ pathname, children }: LayoutProps) {
  const displayChat =
    pathname !== '/supervision' &&
    pathname !== '/mes-jeunes/envoi-message-groupe'

  const enableMultiDestinataireLink: boolean = Boolean(
    process.env.ENABLE_MULTI_DESTINATAIRES_MESSAGE
  )

  return (
    <>
      <div
        className={`${styles.container} ${
          displayChat ? styles.container_with_chat : ''
        }`}
      >
        <Sidebar />
        <div className={styles.page}>
          <main role='main'>{children}</main>
          <Footer />
        </div>
        {displayChat && (
          <ChatRoom enableMultiDestinataireLink={enableMultiDestinataireLink} />
        )}
      </div>
      <div id='modal-root' />
    </>
  )
}

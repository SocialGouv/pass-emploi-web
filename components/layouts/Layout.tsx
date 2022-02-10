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
  const displayChat = pathname !== '/supervision'

  return (
    <>
      <div
        className={
          displayChat ? styles.container : styles.container_without_chat
        }
      >
        <Sidebar />
        <main className={styles.page} role='main'>
          {children}
        </main>
        <Footer />
        {displayChat && <ChatRoom />}
      </div>
      <div id='modal-root' />
    </>
  )
}

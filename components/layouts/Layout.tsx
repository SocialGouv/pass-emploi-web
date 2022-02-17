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
        className={`${styles.container} ${
          displayChat ? styles.container_with_chat : ''
        }`}
      >
        <Sidebar />
        <div className={styles.page}>
          <main role='main'>{children}</main>
          <Footer />
        </div>
        {displayChat && <ChatRoom />}
      </div>
      <div id='modal-root' />
    </>
  )
}

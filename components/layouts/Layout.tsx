/**
 * Shared Layout, see: https://nextjs.org/docs/basic-features/layouts
 */

import styles from 'styles/components/Layouts.module.css'
import ChatRoom from './ChatRoom'

import Sidebar from './Sidebar'

type LayoutProps = {
  children: any
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <div className={styles.container}>
        <Sidebar />
        <main className={styles.page} role='main'>
          {children}
        </main>
        <ChatRoom />
      </div>
      <div id='modal-root' />
    </>
  )
}

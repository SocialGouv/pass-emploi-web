/**
 * Shared Layout, see: https://nextjs.org/docs/basic-features/layouts
 */

import styles from 'styles/components/Layouts.module.css'
import ChatRoom from './ChatRoom'

import Sidebar from './Sidebar'

type LayoutProps = {
  pathname: string
  children: any
}

export default function Layout({ pathname, children }: LayoutProps) {
  const displaysChat = pathname !== '/supervision'

  return (
    <>
      <div className={styles.container}>
        <Sidebar />
        <main className={styles.page} role='main'>
          {children}
        </main>
        {displaysChat && <ChatRoom />}
      </div>
      <div id='modal-root' />
    </>
  )
}

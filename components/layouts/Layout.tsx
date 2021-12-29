/**
 * Shared Layout, see: https://nextjs.org/docs/basic-features/layouts
 */

import styles from 'styles/components/Layouts.module.css'
import { db } from 'utils/firebase'
import ChatBox from './ChatRoom'
import ChatBoxTruc from './ChatRoomTruc'

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
        <ChatBox db={db} />
        <ChatBoxTruc db={db} />
      </div>
      <div id='modal-root' />
    </>
  )
}

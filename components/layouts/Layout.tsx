/**
 * Shared Layout, see: https://nextjs.org/docs/basic-features/layouts
 */

import { db } from 'utils/firebase'

import Sidebar from './Sidebar'
import ChatBox from './ChatRoom'

import styles from 'styles/components/Layouts.module.css'

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
      </div>
      <div id='modal-root' />
    </>
  )
}

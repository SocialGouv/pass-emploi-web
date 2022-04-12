/**
 * Shared Layout, see: https://nextjs.org/docs/basic-features/layouts
 */

import { Footer } from 'components/Footer'
import { ReactElement } from 'react'
import styles from 'styles/components/Layouts.module.css'
import ChatRoom from './ChatRoom'
import Sidebar from './Sidebar'
import { AppHead } from '../AppHead'

type LayoutProps = {
  children: ReactElement
}

//TODO: useEffect observeMessagesNonLusConseiller

export default function Layout({ children }: LayoutProps) {
  const {
    props: { withoutChat, pageTitle },
  } = children

  return (
    <>
      <div
        className={`${styles.container} ${
          !withoutChat ? styles.container_with_chat : ''
        }`}
      >
        <Sidebar />
        <div className={styles.page}>
          <AppHead titre={pageTitle} />
          <main role='main'>{children}</main>
          <Footer />
        </div>
        {!withoutChat && <ChatRoom />}
      </div>
      <div id='modal-root' />
    </>
  )
}

/**
 * Shared Layout, see: https://nextjs.org/docs/basic-features/layouts
 */

import { Footer } from 'components/Footer'
import { ReactElement } from 'react'
import styles from 'styles/components/Layouts.module.css'
import ChatRoom from './ChatRoom'
import Sidebar from './Sidebar'

type LayoutProps = {
  children: ReactElement
}

export default function Layout({ children }: LayoutProps) {
  const enableMultiDestinataireLink: boolean = Boolean(
    process.env.ENABLE_MULTI_DESTINATAIRES_MESSAGE
  )

  const {
    props: { withoutChat },
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
          <main role='main'>{children}</main>
          <Footer />
        </div>
        {!withoutChat && (
          <ChatRoom enableMultiDestinataireLink={enableMultiDestinataireLink} />
        )}
      </div>
      <div id='modal-root' />
    </>
  )
}

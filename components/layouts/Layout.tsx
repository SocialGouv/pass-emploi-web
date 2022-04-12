/**
 * Shared Layout, see: https://nextjs.org/docs/basic-features/layouts
 */

import { ReactElement, useEffect, useState } from 'react'
import { Footer } from 'components/Footer'
import styles from 'styles/components/Layouts.module.css'
import ChatRoom from './ChatRoom'
import Sidebar from './Sidebar'
import { AppHead } from '../AppHead'
import useSession from 'utils/auth/useSession'
import { useDependance } from '../../utils/injectionDependances/diContext'
import { MessagesService } from '../../services/messages.service'
import { JeunesService } from '../../services/jeunes.service'

type LayoutProps = {
  children: ReactElement
}

//TODO: useEffect observeMessagesNonLusConseiller

export default function Layout({ children }: LayoutProps) {
  const {
    props: { withoutChat, pageTitle },
  } = children

  const { data: session } = useSession<true>({ required: true })
  const [hasMessageNonLu, setHasMessageNonLu] = useState<boolean>(false)

  const messagesService = useDependance<MessagesService>('messagesService')
  const jeunesService = useDependance<JeunesService>('jeunesService')

  useEffect(() => {
    if (!session) return

    const { user, accessToken, firebaseToken } = session
    if (firebaseToken) {
      messagesService
        .signIn(firebaseToken)
        .then(() => {
          return jeunesService.getJeunesDuConseiller(user.id, accessToken)
        })
        .then((jeunes) => {
          messagesService.countMessagesNotReadConseiller(
            user.id,
            jeunes.map((jeune) => jeune.id),
            (bool) => {
              setHasMessageNonLu(bool)
            }
          )
        })
    }
  }, [])

  return (
    <>
      <div
        className={`${styles.container} ${
          !withoutChat ? styles.container_with_chat : ''
        }`}
      >
        <Sidebar />
        <div className={styles.page}>
          <AppHead
            titre={hasMessageNonLu ? 'Nouveau(x) message(s)' : pageTitle}
          />
          <main role='main'>{children}</main>
          <Footer />
        </div>
        {!withoutChat && <ChatRoom />}
      </div>
      <div id='modal-root' />
    </>
  )
}

/**
 * Shared Layout, see: https://nextjs.org/docs/basic-features/layouts
 */

import { apm } from '@elastic/apm-rum'
import { useRouter } from 'next/router'
import React, { ReactElement, useEffect, useRef, useState } from 'react'

import AppHead from 'components/AppHead'
import AlertDisplayer from 'components/layouts/AlertDisplayer'
import ChatContainer from 'components/layouts/ChatContainer'
import Footer from 'components/layouts/Footer'
import { Header } from 'components/layouts/Header'
import Sidebar from 'components/layouts/Sidebar'
import { PageProps } from 'interfaces/pageProps'
import { ConseillerService } from 'services/conseiller.service'
import styles from 'styles/components/Layouts.module.css'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useDependance } from 'utils/injectionDependances'

interface LayoutProps {
  children: ReactElement<PageProps>
}

export default function Layout({ children }: LayoutProps) {
  const {
    props: { pageTitle, pageHeader, returnTo, withoutChat },
  } = children

  const router = useRouter()
  const conseillerService =
    useDependance<ConseillerService>('conseillerService')
  const [conseiller, setConseiller] = useConseiller()

  const containerRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const [hasMessageNonLu, setHasMessageNonLu] = useState(false)

  const withChat = !withoutChat

  useEffect(() => {
    // https://dev.to/admitkard/mobile-issue-with-100vh-height-100-100vh-3-solutions-3nae
    function resizeContainerToInnerHeight() {
      if (containerRef.current) {
        containerRef.current.style.height = `${window.innerHeight}px`
        containerRef.current.style.gridTemplateRows = `${window.innerHeight}px`
      }
    }

    resizeContainerToInnerHeight()
    window.addEventListener('resize', resizeContainerToInnerHeight, true)
    return () =>
      window.removeEventListener('resize', resizeContainerToInnerHeight, true)
  }, [])

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTo(0, 0)
  }, [router.asPath, mainRef])

  useEffect(() => {
    if (!conseiller) {
      conseillerService.getConseillerClientSide().then(setConseiller)
    } else {
      const userAPM = {
        id: conseiller.id,
        username: `${conseiller.firstName} ${conseiller.lastName}`,
        email: conseiller.email ?? '',
      }
      apm.setUserContext(userAPM)
    }
  }, [conseiller])

  console.log(router.asPath)
  console.log(router.route)

  return (
    <>
      <AppHead hasMessageNonLu={hasMessageNonLu} titre={pageTitle} />
      <div
        ref={containerRef}
        className={`${styles.container} ${
          withChat ? styles.container_with_chat : ''
        }`}
      >
        <Sidebar />
        <div
          ref={mainRef}
          className={`${styles.page} ${withChat ? styles.page_when_chat : ''}`}
        >
          <Header
            currentPath={router.asPath}
            currentRoute={router.route}
            returnTo={returnTo}
            pageHeader={pageHeader ?? pageTitle}
          />

          <main
            role='main'
            className={`${styles.content} ${
              withChat ? styles.content_when_chat : ''
            }`}
          >
            <AlertDisplayer />
            {children}
          </main>

          <Footer />
        </div>
        <ChatContainer
          displayChat={withChat}
          setHasMessageNonLu={setHasMessageNonLu}
        />
      </div>
      <div id='modal-root' />
    </>
  )
}

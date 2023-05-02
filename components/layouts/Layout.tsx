/**
 * Shared Layout, see: https://nextjs.org/docs/basic-features/layouts
 */

import { apm } from '@elastic/apm-rum'
import { useRouter } from 'next/router'
import React, { ReactElement, useEffect, useRef, useState } from 'react'

import AppHead from 'components/AppHead'
import AlerteDisplayer from 'components/layouts/AlerteDisplayer'
import ChatManager from 'components/layouts/ChatManager'
import Footer from 'components/layouts/Footer'
import { Header } from 'components/layouts/Header'
import Sidebar from 'components/layouts/Sidebar'
import { MODAL_ROOT_ID } from 'components/Modal'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import { compareJeunesByNom } from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { ConseillerService } from 'services/conseiller.service'
import { JeunesService } from 'services/jeunes.service'
import styles from 'styles/components/Layouts.module.css'
import { useConseillerPotentiellementPasRecupere } from 'utils/conseiller/conseillerContext'
import { useDependance } from 'utils/injectionDependances'
import { usePortefeuillePotentiellementPasRecupere } from 'utils/portefeuilleContext'

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
  const jeunesService = useDependance<JeunesService>('jeunesService')

  const [conseiller, setConseiller] = useConseillerPotentiellementPasRecupere()
  const [portefeuille, setPortefeuille] =
    usePortefeuillePotentiellementPasRecupere()

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
      Promise.all([
        conseillerService.getConseillerClientSide(),
        jeunesService.getJeunesDuConseillerClientSide(),
      ]).then(([conseillerRecupere, beneficiaires]) => {
        setConseiller(conseillerRecupere)
        const beneficiairesParOrdreAlphabetique = beneficiaires
          .map(({ id, nom, prenom }) => ({ id, nom, prenom }))
          .sort(compareJeunesByNom)
        setPortefeuille(beneficiairesParOrdreAlphabetique)
      })
    } else {
      const userAPM = {
        id: conseiller.id,
        username: `${conseiller.firstName} ${conseiller.lastName}`,
        email: conseiller.email ?? '',
      }
      apm.setUserContext(userAPM)
    }
  }, [conseiller])

  const pageCouranteEstMessagerie = () => router.pathname === '/messagerie'

  return (
    <>
      <AppHead hasMessageNonLu={hasMessageNonLu} titre={pageTitle} />

      {!conseiller && <SpinningLoader />}

      {conseiller && portefeuille && (
        <>
          {!pageCouranteEstMessagerie() && (
            <div
              ref={containerRef}
              className={`${styles.container} ${
                withChat ? styles.container_with_chat : ''
              }`}
            >
              <Sidebar />

              <div
                ref={mainRef}
                className={`${styles.page} ${
                  withChat ? styles.page_when_chat : ''
                }`}
              >
                <Header
                  currentPath={router.asPath}
                  returnTo={returnTo}
                  pageHeader={pageHeader ?? pageTitle}
                />

                <main
                  role='main'
                  className={`${styles.content} ${
                    withChat ? styles.content_when_chat : ''
                  }`}
                >
                  <AlerteDisplayer />
                  {children}
                </main>

                <Footer />
              </div>

              <ChatManager
                displayChat={withChat}
                setHasMessageNonLu={setHasMessageNonLu}
              />
            </div>
          )}

          {pageCouranteEstMessagerie() && (
            <div
              ref={containerRef}
              className={`${styles.container} ${styles.messagerie_full_screen}`}
            >
              <Sidebar />

              <ChatManager
                displayChat={withChat}
                setHasMessageNonLu={setHasMessageNonLu}
                pageEstMessagerie={true}
              />

              <div ref={mainRef} className={styles.page}>
                <main
                  role='main'
                  className={`${styles.content} ${styles.messagerie_full_screen}`}
                >
                  <AlerteDisplayer />
                  {children}
                </main>

                <Footer />
              </div>
            </div>
          )}
        </>
      )}
      <div id={MODAL_ROOT_ID} />
    </>
  )
}

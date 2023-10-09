/**
 * Shared Layout, see: https://nextjs.org/docs/basic-features/layouts
 */

import { apm } from '@elastic/apm-rum'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useTheme } from 'next-themes'
import React, { ReactElement, useEffect, useRef, useState } from 'react'

import AppHead from 'components/AppHead'
import HeaderCGU from 'components/layouts/HeaderCGU'
import { MODAL_ROOT_ID } from 'components/Modal'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import { doitSignerLesCGU, estPoleEmploiBRSA } from 'interfaces/conseiller'
import { compareJeunesByNom } from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { getConseillerClientSide } from 'services/conseiller.service'
import { getJeunesDuConseillerClientSide } from 'services/jeunes.service'
import styles from 'styles/components/Layouts.module.css'
import { useConseillerPotentiellementPasRecupere } from 'utils/conseiller/conseillerContext'
import { ApiError } from 'utils/httpClient'
import { usePortefeuillePotentiellementPasRecupere } from 'utils/portefeuilleContext'

const ChatManager = dynamic(import('components/layouts/ChatManager'), {
  ssr: false,
})
const Sidebar = dynamic(import('components/layouts/Sidebar'), { ssr: false })
const Header = dynamic(import('components/layouts/Header'), { ssr: false })
const Footer = dynamic(import('components/layouts/Footer'), { ssr: false })
const AlerteDisplayer = dynamic(import('components/layouts/AlerteDisplayer'), {
  ssr: false,
})

interface LayoutProps {
  children: ReactElement<PageProps>
}

export default function Layout({ children }: LayoutProps) {
  const {
    props: { pageTitle, pageHeader, returnTo, withoutChat },
  } = children

  const router = useRouter()
  const { setTheme } = useTheme()

  const [conseiller, setConseiller] = useConseillerPotentiellementPasRecupere()
  const [portefeuille, setPortefeuille] =
    usePortefeuillePotentiellementPasRecupere()

  const containerRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const [hasMessageNonLu, setHasMessageNonLu] = useState(false)

  const pageCouranteEstMessagerie = router.pathname === '/messagerie'
  const pageCouranteEstCGU = router.pathname === '/consentement-cgu'

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
        getConseillerClientSide(),
        getJeunesDuConseillerClientSide(),
      ])
        .then(([conseillerRecupere, beneficiaires]) => {
          setConseiller(conseillerRecupere)
          const beneficiairesParOrdreAlphabetique = beneficiaires
            .map(({ id, nom, prenom }) => ({ id, nom, prenom }))
            .sort(compareJeunesByNom)
          setPortefeuille(beneficiairesParOrdreAlphabetique)
        })
        .catch((e) => {
          if (e instanceof ApiError && e.statusCode === 401) {
            router.push('/api/auth/federated-logout')
          }
          throw e
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

  useEffect(() => {
    if (conseiller && estPoleEmploiBRSA(conseiller)) {
      setTheme('brsa')
    } else {
      setTheme('cej')
    }
  }, [conseiller, conseiller?.structure, setTheme])

  useEffect(() => {
    if (conseiller && doitSignerLesCGU(conseiller)) {
      router.push('/consentement-cgu')
    }
  }, [conseiller, router.asPath])

  return (
    <>
      <AppHead hasMessageNonLu={hasMessageNonLu} titre={pageTitle} />

      {!conseiller && <SpinningLoader />}

      {conseiller && portefeuille && (
        <>
          {!pageCouranteEstMessagerie && !pageCouranteEstCGU && (
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

                <Footer conseiller={conseiller} />
              </div>

              <ChatManager
                displayChat={withChat}
                setHasMessageNonLu={setHasMessageNonLu}
              />
            </div>
          )}

          {pageCouranteEstMessagerie && (
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
                <Footer conseiller={conseiller} />
              </div>
            </div>
          )}

          {pageCouranteEstCGU && (
            <div ref={containerRef} className={`${styles.page_full_screen}`}>
              <div ref={mainRef} className={styles.page}>
                <HeaderCGU
                  conseiller={conseiller}
                  pageHeader={pageHeader ?? pageTitle}
                />
                <main
                  role='main'
                  className={`${styles.content} ${styles.cgu_full_screen}`}
                >
                  <AlerteDisplayer />
                  {children}
                </main>
              </div>
            </div>
          )}
        </>
      )}

      <div id={MODAL_ROOT_ID} />
    </>
  )
}

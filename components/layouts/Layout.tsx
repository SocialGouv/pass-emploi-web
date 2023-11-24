/**
 * Shared Layout, see: https://nextjs.org/docs/basic-features/layouts
 */

import { apm } from '@elastic/apm-rum'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTheme } from 'next-themes'
import React, {
  forwardRef,
  ReactElement,
  Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import AppHead from 'components/AppHead'
import { MODAL_ROOT_ID } from 'components/Modal'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import { estPoleEmploiBRSA } from 'interfaces/conseiller'
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
const SidebarLayout = dynamic(import('components/layouts/SidebarLayout'), {
  ssr: false,
})
const DeprecatedHeader = dynamic(
  import('components/deprecated/DeprecatedHeader'),
  { ssr: false }
)
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
  const skipLinkRefContainer = useRef<HTMLSpanElement>(null)
  const mainRefContainer = useRef<HTMLDivElement>(null)
  const [hasMessageNonLu, setHasMessageNonLu] = useState(false)

  const pageCouranteEstMessagerie = router.pathname === '/messagerie'

  const withChat = !withoutChat

  function focusOnMain() {
    const findFirstFocusableElement = (element) => {
      const focusableElements = element.querySelectorAll(
        'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"], [role="tablist"])'
      )
      return focusableElements[0]
    }
    if (mainRef.current) {
      const firstFocusableElement = findFirstFocusableElement(mainRef.current)
      if (firstFocusableElement) {
        firstFocusableElement.focus()
      }
    }
  }

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
    if (skipLinkRefContainer.current) {
      skipLinkRefContainer.current.focus()
    }
  }, [skipLinkRefContainer, router.pathname])

  return (
    <>
      <AppHead hasMessageNonLu={hasMessageNonLu} titre={pageTitle} />
      <LienEvitement ref={skipLinkRefContainer} onClick={focusOnMain} />

      {!conseiller && <SpinningLoader />}

      {conseiller && portefeuille && (
        <>
          {!pageCouranteEstMessagerie && (
            <div
              ref={containerRef}
              className={`${styles.container} ${
                withChat ? styles.container_with_chat : ''
              }`}
            >
              <SidebarLayout />

              <div
                ref={mainRefContainer}
                className={`${styles.page} ${
                  withChat ? styles.page_when_chat : ''
                }`}
              >
                <DeprecatedHeader
                  currentPath={router.asPath}
                  returnTo={returnTo}
                  pageHeader={pageHeader ?? pageTitle}
                />

                <main
                  ref={mainRef}
                  role='main'
                  id='contenu'
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
              <SidebarLayout />

              <ChatManager
                displayChat={withChat}
                setHasMessageNonLu={setHasMessageNonLu}
                pageEstMessagerie={true}
              />

              <div ref={mainRefContainer} className={styles.page}>
                <main
                  ref={mainRef}
                  id='contenu'
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
        </>
      )}

      <div id={MODAL_ROOT_ID} />
    </>
  )
}

const LienEvitement = forwardRef(
  (props: { onClick: () => void }, forwardedRef: Ref<HTMLSpanElement>) => {
    const { onClick } = props
    const ref = useRef<HTMLSpanElement>(null)

    useImperativeHandle(forwardedRef, () => ref.current as HTMLSpanElement)

    return (
      <span ref={ref} tabIndex={-1}>
        <Link
          href='#contenu'
          onClick={onClick}
          className='sr-only focus:not-sr-only focus:text-primary'
        >
          Aller au contenu
        </Link>
      </span>
    )
  }
)

LienEvitement.displayName = 'LienEvitement'

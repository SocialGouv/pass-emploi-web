'use client'

import {
  ReadonlyURLSearchParams,
  usePathname,
  useSearchParams,
} from 'next/navigation'
import React, { ReactNode, useEffect, useState } from 'react'

import { MIN_DESKTOP_WIDTH, MODAL_ROOT_ID } from 'components/globals'
import Footer from 'components/layouts/Footer'
import OnboardingMobileModal from 'components/onboarding/OnboardingMobileModal'
import { StructureConseiller } from 'interfaces/conseiller'
import { trackPage } from 'utils/analytics/matomo'
import { signin } from 'utils/auth/auth'
import { LoginErrorMessageProvider } from 'utils/auth/loginErrorMessageContext'

export default function LayoutLoginClient({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [errorMsg, setErrorMsg] = useState<string>()
  const [afficherOnboarding, setAfficherOnboarding] = useState<boolean>(false)

  const isFromEmail = getIsFromEmail(searchParams)

  const pageEstHubLogin = pathname === '/login'
  const pageEstLoginCEJ = pathname.includes('cej')

  useEffect(() => {
    trackPage({
      customTitle: isFromEmail ? 'Connexion - Origine email' : 'Connexion',
      structure: null,
      aDesBeneficiaires: null,
    })
  }, [])

  useEffect(() => {
    const provider = searchParams.get('provider')
    if (provider)
      signin(
        `${provider}-conseiller`,
        setErrorMsg,
        searchParams.get('redirectUrl') ?? undefined
      )
  }, [])

  useEffect(() => {
    if (window.innerWidth < MIN_DESKTOP_WIDTH) {
      setAfficherOnboarding(true)
    }
  }, [])

  return (
    <>
      <LoginErrorMessageProvider state={[errorMsg, setErrorMsg]}>
        <div className='flex flex-col justify-center h-screen w-screen overflow-y-auto'>
          {children}

          {!pageEstHubLogin && (
            <Footer
              conseiller={{
                structure: pageEstLoginCEJ
                  ? StructureConseiller.MILO
                  : StructureConseiller.POLE_EMPLOI_BRSA,
              }}
              aDesBeneficiaires={null}
              planDuSiteEstCache={true}
            />
          )}
        </div>
      </LoginErrorMessageProvider>

      {afficherOnboarding && (
        <OnboardingMobileModal onClose={() => setAfficherOnboarding(false)} />
      )}

      <div id={MODAL_ROOT_ID} />
    </>
  )
}

function getIsFromEmail(searchParams: ReadonlyURLSearchParams): boolean {
  return Boolean(
    searchParams.get('source') ||
      searchParams.get('redirectUrl')?.includes('notif-mail')
  )
}

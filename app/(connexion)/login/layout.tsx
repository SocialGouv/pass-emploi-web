'use client'

import {
  ReadonlyURLSearchParams,
  usePathname,
  useSearchParams,
} from 'next/navigation'
import { signIn } from 'next-auth/react'
import React, { ReactNode, useEffect, useState } from 'react'

import { MODAL_ROOT_ID } from 'components/ids'
import Footer from 'components/layouts/Footer'
import OnboardingMobileModal from 'components/onboarding/OnboardingMobileModal'
import { StructureConseiller } from 'interfaces/conseiller'
import { trackPage } from 'utils/analytics/matomo'
import { LoginErrorMessageProvider } from 'utils/auth/loginErrorMessageContext'

export default function LayoutLoginPage({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [errorMsg, setErrorMsg] = useState<string>()
  const [afficherOnboarding, setAfficherOnboarding] = useState<boolean>(false)

  const MIN_DESKTOP_WIDTH = 600
  const isFromEmail = getIsFromEmail(searchParams)

  const pageEstHubLogin = pathname === '/login'
  const pageEstLoginCEJ = pathname.includes('cej')

  useEffect(() => {
    const provider = searchParams.get('provider')
    if (provider) signin(searchParams, setErrorMsg, `${provider}-conseiller`)
  }, [])

  useEffect(() => {
    if (window.innerWidth < MIN_DESKTOP_WIDTH) {
      console.log('>>>> POPOPOPOPO')
      setAfficherOnboarding(true)
    }

    trackPage({
      customTitle: isFromEmail ? 'Connexion - Origine email' : 'Connexion',
      structure: null,
      aDesBeneficiaires: null,
    })
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

export async function signin(
  searchParams: ReadonlyURLSearchParams,
  onError: (message: string) => void,
  provider?: string
) {
  const redirectUrl = searchParams.get('redirectUrl')
  try {
    const callbackUrl: string = redirectUrl
      ? '/?' + new URLSearchParams({ redirectUrl })
      : '/'
    await signIn('keycloak', { callbackUrl }, { kc_idp_hint: provider ?? '' })
  } catch (error) {
    console.error(error)
    onError("une erreur est survenue lors de l'authentification")
  }
}

function getIsFromEmail(searchParams: ReadonlyURLSearchParams): boolean {
  return Boolean(
    searchParams.get('source') ||
      searchParams.get('redirectUrl')?.includes('notif-mail')
  )
}

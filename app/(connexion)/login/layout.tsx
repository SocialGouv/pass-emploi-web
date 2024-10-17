'use client'

import {
  ReadonlyURLSearchParams,
  redirect,
  usePathname,
  useSearchParams,
} from 'next/navigation'
import { signIn } from 'next-auth/react'
import React, { ReactNode, useEffect, useState } from 'react'

import { MODAL_ROOT_ID } from 'components/ids'
import OnboardingMobileModal from 'components/onboarding/OnboardingMobileModal'
import ExternalLink from 'components/ui/Navigation/ExternalLink'
import { StructureConseiller } from 'interfaces/conseiller'
import { trackPage } from 'utils/analytics/matomo'
import { getSessionServerSide } from 'utils/auth/auth'
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

  const labelLienAccessibilite = 'Niveau d’accessibilité: non conforme'
  const hrefLienAccessibilite = `https://doc.pass-emploi.beta.gouv.fr/legal/web_${pageEstLoginCEJ ? '' : 'pass_emploi_'}accessibilite/`

  function trackAccessibilitePage() {
    trackPage({
      customTitle: labelLienAccessibilite,
      structure: pageEstLoginCEJ
        ? StructureConseiller.MILO
        : StructureConseiller.POLE_EMPLOI_BRSA,
      aDesBeneficiaires: null,
    })
  }

  useEffect(() => {
    redirectIfAlreadyConnected(searchParams)
  }, [])

  useEffect(() => {
    const provider = searchParams.get('provider')
    if (provider) signin(searchParams, setErrorMsg, `${provider}-conseiller`)
  }, [])

  useEffect(() => {
    if (window.innerWidth < MIN_DESKTOP_WIDTH) {
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
            <footer
              role='contentinfo'
              className='flex justify-center py-4 px-0 border-solid border-primary_lighten border-t-2'
            >
              <span className='text-primary hover:text-primary_darken'>
                <ExternalLink
                  href={hrefLienAccessibilite}
                  label={labelLienAccessibilite}
                  onClick={trackAccessibilitePage}
                />
              </span>
            </footer>
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

async function redirectIfAlreadyConnected(
  searchParams?: ReadonlyURLSearchParams
): Promise<void> {
  const session = await getSessionServerSide()

  const querySource =
    searchParams?.get('source') && `?source=${searchParams?.get('source')}`

  if (session) {
    const redirectUrl: string =
      searchParams?.get('redirectUrl') ?? `/${querySource || ''}`
    redirect(redirectUrl)
  }
}

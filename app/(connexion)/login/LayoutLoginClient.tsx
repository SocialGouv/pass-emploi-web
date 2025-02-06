'use client'

import Link from 'next/link'
import {
  ReadonlyURLSearchParams,
  usePathname,
  useSearchParams,
} from 'next/navigation'
import React, { ReactNode, useEffect, useState } from 'react'

import { MIN_DESKTOP_WIDTH } from 'components/globals'
import Footer from 'components/layouts/Footer'
import OnboardingMobileModal from 'components/onboarding/OnboardingMobileModal'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { trackPage } from 'utils/analytics/matomo'
import { signin } from 'utils/auth/auth'
import { LoginErrorMessageProvider } from 'utils/auth/loginErrorMessageContext'
import { liensFooterLogin } from 'utils/liensFooter'

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
        <div className='flex flex-col h-screen w-screen overflow-y-auto'>
          <div className='grow flex flex-col justify-center bg-primary_lighten'>
            <div className='max-w-[1020px] bg-white rounded-l p-16 mx-auto relative'>
              {!pageEstHubLogin && (
                <Link
                  href='/login' // FIXME
                  className='flex items-center text-s-regular text-content_color underline hover:text-primary'
                >
                  <IconComponent
                    name={IconName.ArrowBackward}
                    aria-hidden={true}
                    focusable={false}
                    className='w-4 h-4 fill-current mr-3'
                  />
                  Retour
                </Link>
              )}

              {children}
            </div>
          </div>

          <Footer liens={liensFooterLogin} />
        </div>
      </LoginErrorMessageProvider>

      {afficherOnboarding && (
        <OnboardingMobileModal onClose={() => setAfficherOnboarding(false)} />
      )}
    </>
  )
}

function getIsFromEmail(searchParams: ReadonlyURLSearchParams): boolean {
  return Boolean(
    searchParams.get('source') ||
      searchParams.get('redirectUrl')?.includes('notif-mail')
  )
}

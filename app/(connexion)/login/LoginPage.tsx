'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import React, { FormEvent, useEffect, useState } from 'react'

import LogoCEJ from 'assets/images/logo_app_cej.svg'
import LogoPassEmploi from 'assets/images/logo_pass_emploi.svg'
import { MODAL_ROOT_ID } from 'components/ids'
import { ButtonStyle } from 'components/ui/Button/Button'
import { FormButton } from 'components/ui/Form/FormButton'
import { trackPage } from 'utils/analytics/matomo'

const OnboardingMobileModal = dynamic(
  () => import('components/onboarding/OnboardingMobileModal')
)

interface LoginProps {
  ssoPoleEmploiBRSAEstActif?: boolean
  ssoPoleEmploiAIJEstActif?: boolean
  isFromEmail: boolean
}

function LoginPage({
  ssoPoleEmploiBRSAEstActif,
  ssoPoleEmploiAIJEstActif,
  isFromEmail,
}: LoginProps) {
  const [errorMsg, setErrorMsg] = useState('')
  const searchParams = useSearchParams()

  const MIN_DESKTOP_WIDTH = 600
  const [afficherOnboarding, setAfficherOnboarding] = useState(false)

  async function handleSignin(event: FormEvent, provider?: string) {
    event.preventDefault()
    await signin(provider)
  }

  async function signin(provider?: string) {
    const redirectUrl = searchParams.get('redirectUrl')
    try {
      const callbackUrl: string = redirectUrl
        ? '/?' + new URLSearchParams({ redirectUrl })
        : '/'
      await signIn('keycloak', { callbackUrl }, { kc_idp_hint: provider ?? '' })
    } catch (error) {
      console.error(error)
      setErrorMsg("une erreur est survenue lors de l'authentification")
    }
  }

  useEffect(() => {
    const provider = searchParams.get('provider')
    if (provider) signin(`${provider}-conseiller`)
  }, [])

  useEffect(() => {
    if (window.innerWidth < MIN_DESKTOP_WIDTH) setAfficherOnboarding(true)

    trackPage({
      customTitle: isFromEmail ? 'Connexion - Origine email' : 'Connexion',
      structure: null,
      aDesBeneficiaires: null,
    })
  }, [])

  return (
    <main role='main' className='bg-primary_lighten w-full grow relative'>
      <div className='absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4'>
        <div className='bg-blanc p-[25px] layout_s:px-[122px] rounded-l drop-shadow-lg'>
          <h2>
            <span className='sr-only'>Contrat d’engagement jeune</span>
            <LogoCEJ
              className='m-auto h-[64px] w-[120px] fill-primary_darken'
              focusable={false}
              aria-hidden={true}
            />
          </h2>
          <ul className='mt-6'>
            <li>
              <FormButton
                label='Connexion conseiller Mission Locale'
                className='whitespace-nowrap'
                handleSubmit={(event) =>
                  handleSignin(event, 'similo-conseiller')
                }
              />
            </li>
            <li>
              <FormButton
                label='Connexion conseiller France Travail CEJ'
                className='mt-4 whitespace-nowrap'
                handleSubmit={(event) => handleSignin(event, 'pe-conseiller')}
              />
            </li>
          </ul>

          {(ssoPoleEmploiBRSAEstActif || ssoPoleEmploiAIJEstActif) && (
            <>
              <h2 className='mt-16'>
                <span className='sr-only'>pass emploi</span>
                <LogoPassEmploi
                  className='m-auto fill-primary_darken'
                  focusable={false}
                  aria-hidden={true}
                />
              </h2>
              <ul>
                {ssoPoleEmploiBRSAEstActif && (
                  <li>
                    <FormButton
                      label='Connexion conseiller France Travail BRSA'
                      className='mt-6 whitespace-nowrap'
                      style={ButtonStyle.PRIMARY_DARK}
                      handleSubmit={(event) =>
                        handleSignin(event, 'pe-brsa-conseiller')
                      }
                    />
                  </li>
                )}

                {ssoPoleEmploiAIJEstActif && (
                  <li>
                    <FormButton
                      label='Connexion conseiller France Travail AIJ'
                      className='mt-6 whitespace-nowrap'
                      style={ButtonStyle.PRIMARY_DARK}
                      handleSubmit={(event) =>
                        handleSignin(event, 'pe-aij-conseiller')
                      }
                    />
                  </li>
                )}
              </ul>
            </>
          )}
          {errorMsg && <p className='error'>{errorMsg}</p>}
        </div>
      </div>

      {afficherOnboarding && (
        <OnboardingMobileModal onClose={() => setAfficherOnboarding(false)} />
      )}

      <div id={MODAL_ROOT_ID} />
    </main>
  )
}

export default withTransaction(LoginPage.name, 'page')(LoginPage)

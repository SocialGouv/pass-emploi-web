'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import React, { FormEvent, useEffect, useState } from 'react'

import { MODAL_ROOT_ID } from 'components/ids'
import { ButtonStyle } from 'components/ui/Button/Button'
import { FormButton } from 'components/ui/Form/FormButton'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'
import { trackPage } from 'utils/analytics/matomo'

const OnboardingMobileModal = dynamic(
  () => import('components/onboarding/OnboardingMobileModal')
)

interface LoginProps {
  ssoFranceTravailBRSAEstActif?: boolean
  ssoFranceTravailAIJEstActif?: boolean
  ssoConseillerDeptEstActif?: boolean
  isFromEmail: boolean
}

function LoginPage({
  ssoFranceTravailBRSAEstActif,
  ssoFranceTravailAIJEstActif,
  ssoConseillerDeptEstActif,
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
    <main className='mx-auto relative'>
      <div className='flex-1 flex flex-col gap-8 justify-center items-center bg-white py-8 px-6 rounded-l drop-shadow-lg layout_s:flex-row'>
        <div className='flex-1 flex-col justify-items-center'>
          <h2>
            <span className='sr-only'>Contrat d’engagement jeune</span>
            <IllustrationComponent
              name={IllustrationName.LogoCEJ}
              className='m-auto w-[160px] fill-primary_darken'
              focusable={false}
              aria-hidden={true}
            />
          </h2>
          <ul className='mt-6 flex flex-col items-center'>
            <li>
              <FormButton
                label='Connexion Mission Locale'
                className='w-64 whitespace-nowrap'
                handleSubmit={(event) =>
                  handleSignin(event, 'similo-conseiller')
                }
              />
            </li>
            <li>
              <FormButton
                label='Connexion France Travail CEJ'
                className='w-64 mt-6 whitespace-nowrap'
                handleSubmit={(event) => handleSignin(event, 'pe-conseiller')}
              />
            </li>
          </ul>
        </div>

        <div className='flex-1 border-l-2 border-primary_lighten h-60 hidden layout_s:block'></div>

        <div className='flex-1 flex-col'>
          {(ssoFranceTravailBRSAEstActif ||
            ssoFranceTravailAIJEstActif ||
            ssoConseillerDeptEstActif) && (
            <>
              <h2>
                <span className='sr-only'>pass emploi</span>
                <IllustrationComponent
                  name={IllustrationName.LogoPassemploi}
                  className='m-auto w-[160px] fill-primary_darken'
                  focusable={false}
                  aria-hidden={true}
                />
              </h2>
              <ul className='flex flex-col items-center'>
                {ssoFranceTravailBRSAEstActif && (
                  <li>
                    <FormButton
                      label='Connexion BRSA'
                      className='w-64 mt-6 whitespace-nowrap'
                      style={ButtonStyle.PRIMARY_DARK}
                      handleSubmit={(event) =>
                        handleSignin(event, 'pe-brsa-conseiller')
                      }
                    />
                  </li>
                )}

                {ssoFranceTravailAIJEstActif && (
                  <li>
                    <FormButton
                      label='Connexion AIJ'
                      className='w-64 mt-6 whitespace-nowrap'
                      style={ButtonStyle.PRIMARY_DARK}
                      handleSubmit={(event) =>
                        handleSignin(event, 'pe-aij-conseiller')
                      }
                    />
                  </li>
                )}

                {ssoConseillerDeptEstActif && (
                  <li>
                    <FormButton
                      label='Conseiller départemental'
                      className='w-64 mt-6 whitespace-nowrap'
                      style={ButtonStyle.PRIMARY_DARK}
                      handleSubmit={(event) =>
                        handleSignin(event, 'conseiller-dept')
                      }
                    />
                  </li>
                )}
              </ul>
            </>
          )}
        </div>
        {errorMsg && <p className='error'>{errorMsg}</p>}
      </div>

      {afficherOnboarding && (
        <OnboardingMobileModal onClose={() => setAfficherOnboarding(false)} />
      )}

      <div id={MODAL_ROOT_ID} />
    </main>
  )
}

export default withTransaction(LoginPage.name, 'page')(LoginPage)

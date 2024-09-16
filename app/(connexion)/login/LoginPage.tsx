'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import React, { FormEvent, useEffect, useState } from 'react'

import { MODAL_ROOT_ID } from 'components/ids'
import { ButtonStyle } from 'components/ui/Button/Button'
import FormButton from 'components/ui/Form/FormButton'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
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
      {errorMsg && <FailureAlert label={errorMsg} />}

      <div className='grid grid-cols-1 px-6 py-12 bg-white rounded-l shadow-m layout_s:grid-rows-[repeat(2,auto)] layout_s:grid-flow-col layout_s:auto-cols-fr'>
        <h2 className='px-6 layout_s:border-r-2 layout_s:border-grey_100'>
          <span className='sr-only'>Contrat d’engagement jeune</span>
          <IllustrationComponent
            name={IllustrationName.LogoCEJ}
            className='m-auto h-[90px] fill-primary_darken'
            focusable={false}
            aria-hidden={true}
          />
        </h2>
        <ul className='px-6 pt-6 flex flex-col gap-4 layout_s:border-r-2 layout_s:border-grey_100 '>
          <li>
            <FormButton
              label='Connexion Mission Locale'
              className='whitespace-nowrap'
              handleSubmit={(event) => handleSignin(event, 'similo-conseiller')}
            />
          </li>
          <li>
            <FormButton
              label='Connexion France Travail'
              className='whitespace-nowrap'
              handleSubmit={(event) => handleSignin(event, 'pe-conseiller')}
            />
          </li>
        </ul>

        <h2 className='px-6 pt-6 layout_s:pt-0'>
          <span className='sr-only'>pass emploi</span>
          <IllustrationComponent
            name={IllustrationName.LogoPassemploi}
            className='m-auto h-[90px] fill-primary_darken'
            focusable={false}
            aria-hidden={true}
          />
        </h2>
        <ul className='px-6 pt-6 flex flex-col gap-4'>
          {ssoFranceTravailBRSAEstActif && (
            <li>
              <FormButton
                label='Connexion BRSA'
                className='whitespace-nowrap'
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
                className='whitespace-nowrap'
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
                label='Connexion Conseil départemental'
                className='whitespace-nowrap'
                style={ButtonStyle.PRIMARY_DARK}
                handleSubmit={(event) => handleSignin(event, 'conseiller-dept')}
              />
            </li>
          )}
        </ul>
      </div>

      {afficherOnboarding && (
        <OnboardingMobileModal onClose={() => setAfficherOnboarding(false)} />
      )}

      <div id={MODAL_ROOT_ID} />
    </main>
  )
}

export default withTransaction(LoginPage.name, 'page')(LoginPage)

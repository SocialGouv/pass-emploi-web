import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import { getSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { FormEvent, useCallback, useEffect, useState } from 'react'

import Logo from 'assets/images/logo_app_cej.svg'
import OnboardingMobileModal from 'components/OnboardingMobileModal'
import Button from 'components/ui/Button/Button'
import { FormButton } from 'components/ui/Form/FormButton'
import styles from 'styles/components/Login.module.css'
import useMatomo from 'utils/analytics/useMatomo'

interface LoginProps {
  ssoPassEmploiEstActif?: boolean
  isFromEmail: boolean
}

function Login({ ssoPassEmploiEstActif, isFromEmail }: LoginProps) {
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  const MIN_DESKTOP_WIDTH = 600
  const [afficherOnboarding, setAfficherOnboarding] = useState(false)
  const [deferredInstallPrompt, setDeferredInstallPrompt] =
    useState<BeforeInstallPromptEvent>()

  async function handleSignin(event: FormEvent, provider?: string) {
    event.preventDefault()
    await signin(provider)
  }

  const signin = useCallback(
    async (provider?: string) => {
      const redirectUrl: string = router.query.redirectUrl as string
      try {
        const callbackUrl: string = redirectUrl
          ? '/index?' + new URLSearchParams({ redirectUrl })
          : '/'
        await signIn(
          'keycloak',
          { callbackUrl },
          { kc_idp_hint: provider ?? '' }
        )
      } catch (error) {
        console.error(error)
        setErrorMsg("une erreur est survenue lors de l'authentification")
      }
    },
    [router]
  )

  function addAppToHomeScreen() {
    if (!deferredInstallPrompt) return
    deferredInstallPrompt.prompt()
    deferredInstallPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt')
      } else {
        console.log('User dismissed the A2HS prompt')
      }
      setDeferredInstallPrompt(undefined)
    })
  }

  useEffect(() => {
    const provider = router?.query.provider
    switch (provider) {
      case 'pe':
      case 'similo':
        signin(`${provider}-conseiller`)
    }
  }, [router, signin])

  useEffect(() => {
    if (window.innerWidth < MIN_DESKTOP_WIDTH) setAfficherOnboarding(true)
  }, [])

  useEffect(() => {
    function getListener(e: Event) {
      e.preventDefault()
      console.log('BEFORE INSTALL PROMPT')
      setDeferredInstallPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', getListener)
    return () => window.removeEventListener('beforeinstallprompt', getListener)
  })

  useMatomo(isFromEmail ? 'Connexion - Origine email' : 'Connexion')

  return (
    <div className={`${styles.login} w-full h-screen relative`}>
      {deferredInstallPrompt && (
        <Button onClick={addAppToHomeScreen}>
          Installer l&apos;application
        </Button>
      )}

      <div className='absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4'>
        <Logo
          focusable='false'
          aria-hidden={true}
          className='m-auto h-56 w-56'
        />

        <div className='bg-blanc px-[122px] py-[48px] rounded-x_large'>
          <h1 className='text-m-bold text-primary_darken text-center mb-[48px]'>
            Connectez-vous à l&apos;espace conseiller
          </h1>

          <FormButton
            label='Connexion conseiller Mission Locale'
            className='pt-4'
            handleSubmit={(event) => handleSignin(event, 'similo-conseiller')}
          />
          <FormButton
            label='Connexion conseiller Pôle emploi'
            className='pt-4'
            handleSubmit={(event) => handleSignin(event, 'pe-conseiller')}
          />

          {ssoPassEmploiEstActif && (
            <FormButton
              className='mt-4'
              label='Authentification pass emploi'
              handleSubmit={(event) => handleSignin(event)}
            />
          )}

          {errorMsg && <p className='error'>{errorMsg}</p>}
        </div>
      </div>

      {afficherOnboarding && (
        <OnboardingMobileModal onClose={() => setAfficherOnboarding(false)} />
      )}

      <div id='modal-root' />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<{}> = async (
  context
): Promise<GetServerSidePropsResult<{}>> => {
  const session = await getSession({ req: context.req })
  const querySource = context.query.source && `?source=${context.query.source}`

  if (session) {
    const redirectUrl: string =
      (context.query.redirectUrl as string) ?? `/index${querySource || ''}`

    return {
      redirect: {
        destination: redirectUrl,
        permanent: false,
      },
    }
  }

  const isFromEmail: boolean = Boolean(
    context.query.source ||
      (context.query.redirectUrl as string)?.includes('notif-mail')
  )

  return {
    props: {
      ssoPassEmploiEstActif: process.env.ENABLE_PASS_EMPLOI_SSO,
      isFromEmail: isFromEmail,
    },
  }
}

export default withTransaction(Login.name, 'page')(Login)

interface BeforeInstallPromptEvent extends Event {
  userChoice: Promise<any>
  prompt: () => void
}

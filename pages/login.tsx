import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'
import { getSession, signIn } from 'next-auth/react'
import React, { FormEvent, useCallback, useEffect, useState } from 'react'

import Logo from 'assets/images/logo_app_cej.svg'
import OnboardingMobileModal from 'components/OnboardingMobileModal'
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

  async function handleSignin(event: FormEvent, provider?: string) {
    event.preventDefault()
    await signin(provider)
  }

  const signin = useCallback(
    async (provider?: string) => {
      const redirectUrl: string = router.query.redirectUrl as string
      try {
        const callbackUrl: string = redirectUrl
          ? '/?' + new URLSearchParams({ redirectUrl })
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

  useEffect(() => {
    const provider = router?.query.provider
    switch (provider) {
      case 'pe':
      case 'pe-brsa':
      case 'similo':
        signin(`${provider}-conseiller`)
    }
  }, [router, signin])

  useEffect(() => {
    if (window.innerWidth < MIN_DESKTOP_WIDTH) setAfficherOnboarding(true)
  }, [])

  useMatomo(isFromEmail ? 'Connexion - Origine email' : 'Connexion')

  return (
    <div className={`${styles.login} w-full h-screen relative`}>
      <div className='absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4'>
        <Logo
          focusable='false'
          aria-hidden={true}
          className='m-auto h-56 w-56'
        />

        <div className='bg-blanc p-[25px] layout_s:px-[122px] rounded-base'>
          <h1 className='text-m-bold text-primary_darken text-center mb-[24px]'>
            Connectez-vous à l&apos;espace conseiller
          </h1>

          <FormButton
            label='Connexion conseiller Mission Locale'
            className='whitespace-nowrap'
            handleSubmit={(event) => handleSignin(event, 'similo-conseiller')}
          />
          <FormButton
            label='Connexion conseiller Pôle emploi CEJ'
            className='pt-4 whitespace-nowrap'
            handleSubmit={(event) => handleSignin(event, 'pe-conseiller')}
          />
          <FormButton
            label='Connexion conseiller Pôle emploi BRSA'
            className='pt-4 whitespace-nowrap'
            handleSubmit={(event) => handleSignin(event, 'pe-brsa-conseiller')}
          />

          {ssoPassEmploiEstActif && (
            <FormButton
              className='mt-4 whitespace-nowrap'
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
      (context.query.redirectUrl as string) ?? `/${querySource || ''}`

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

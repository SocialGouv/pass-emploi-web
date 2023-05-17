import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'
import { getSession, signIn } from 'next-auth/react'
import React, { FormEvent, useCallback, useEffect, useState } from 'react'

import LogoCEJ from 'assets/images/logo_app_cej.svg'
import LogoPassEmploi from 'assets/images/logo_pass_emploi.svg'
import OnboardingMobileModal from 'components/OnboardingMobileModal'
import { ButtonStyle } from 'components/ui/Button/Button'
import { FormButton } from 'components/ui/Form/FormButton'
import styles from 'styles/components/Login.module.css'
import useMatomo from 'utils/analytics/useMatomo'

interface LoginProps {
  ssoPoleEmploiBRSAEstActif?: boolean
  ssoPassEmploiEstActif?: boolean
  isFromEmail: boolean
}

function Login({
  ssoPassEmploiEstActif,
  ssoPoleEmploiBRSAEstActif,
  isFromEmail,
}: LoginProps) {
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
        <h1 className='text-m-bold text-primary_darken text-center mb-[24px]'>
          Connectez-vous à l&apos;espace conseiller
        </h1>

        <div className='bg-blanc p-[25px] layout_s:px-[122px] rounded-base'>
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
                label='Connexion conseiller Pôle emploi CEJ'
                className='mt-4 whitespace-nowrap'
                handleSubmit={(event) => handleSignin(event, 'pe-conseiller')}
              />
            </li>
            {ssoPassEmploiEstActif && (
              <li>
                <FormButton
                  className='mt-4 whitespace-nowrap'
                  label='Authentification pass emploi'
                  handleSubmit={(event) => handleSignin(event)}
                />
              </li>
            )}
          </ul>

          {ssoPoleEmploiBRSAEstActif && (
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
                <li>
                  <FormButton
                    label='Connexion conseiller Pôle emploi BRSA'
                    className='mt-6 whitespace-nowrap'
                    style={ButtonStyle.PRIMARY_BRSA}
                    handleSubmit={(event) =>
                      handleSignin(event, 'pe-brsa-conseiller')
                    }
                  />
                </li>
              </ul>
            </>
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
      ssoPoleEmploiBRSAEstActif: process.env.ENABLE_PE_BRSA_SSO,
      ssoPassEmploiEstActif: process.env.ENABLE_PASS_EMPLOI_SSO,
      isFromEmail: isFromEmail,
    },
  }
}

export default withTransaction(Login.name, 'page')(Login)

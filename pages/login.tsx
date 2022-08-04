import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import { unstable_getServerSession } from 'next-auth'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { FormEvent, useCallback, useEffect, useState } from 'react'

import Logo from 'assets/images/logo_app_cej.svg'
import { FormButton } from 'components/ui/FormButton'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import styles from 'styles/components/Login.module.css'
import useMatomo from 'utils/analytics/useMatomo'

interface LoginProps {
  ssoPassEmploiEstActif?: boolean
  isFromEmail: boolean
}

function Login({ ssoPassEmploiEstActif, isFromEmail }: LoginProps) {
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

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

  useEffect(() => {
    const provider = router?.query.provider
    switch (provider) {
      case 'pe':
      case 'similo':
        signin(`${provider}-conseiller`)
    }
  }, [router, signin])

  useMatomo(isFromEmail ? 'Connexion - Origine email' : 'Connexion')

  return (
    <div className={`${styles.login} w-full h-screen relative`}>
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
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<{}> = async ({
  query,
  req,
  res,
}): Promise<GetServerSidePropsResult<{}>> => {
  const session = await unstable_getServerSession(req, res, authOptions)
  const querySource = query.source && `?source=${query.source}`

  if (session) {
    const redirectUrl: string =
      (query.redirectUrl as string) ?? `/index${querySource || ''}`

    return {
      redirect: {
        destination: redirectUrl,
        permanent: false,
      },
    }
  }

  const isFromEmail: boolean = Boolean(
    query.source || (query.redirectUrl as string)?.includes('notif-mail')
  )

  return {
    props: {
      ssoPassEmploiEstActif: process.env.ENABLE_PASS_EMPLOI_SSO,
      isFromEmail: isFromEmail,
    },
  }
}

export default withTransaction(Login.name, 'page')(Login)

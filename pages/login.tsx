import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import { getSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useState } from 'react'

import Logo from '../assets/images/logo_258.svg'

import { FormButton } from 'components/ui/FormButton'
import useMatomo from 'utils/analytics/useMatomo'

interface LoginProps {
  ssoPassEmploiEstActive?: boolean
  isFromEmail: boolean
}

function Login({ ssoPassEmploiEstActive, isFromEmail }: LoginProps) {
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  const signin = useCallback(
    async (provider?: string) => {
      const redirectUrl: string = router.query.redirectUrl as string
      try {
        const callbackUrl: string = redirectUrl
          ? '/index?' + new URLSearchParams({ redirectUrl })
          : '/'
        await signIn(
          'keycloak',
          {
            callbackUrl: callbackUrl,
          },
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

  async function handleSubmit(event: any, provider?: string) {
    event.preventDefault()
    signin(provider)
  }

  useMatomo(isFromEmail ? 'Connexion - Origine email' : 'Connexion')

  return (
    <div className='bg-bleu_blanc w-full h-screen relative'>
      <div className='absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4'>
        <Logo focusable='false' aria-hidden={true} className='m-auto' />

        <div className='bg-blanc px-[122px] py-[48px] rounded-x_large'>
          <h1 className='text-lg-semi text-bleu_nuit text-center mb-[48px]'>
            Connectez-vous à l&apos;espace conseiller
          </h1>

          {ssoPassEmploiEstActive && (
            <FormButton
              label='Authentification pass emploi'
              handleSubmit={(event) => handleSubmit(event)}
            />
          )}

          <FormButton
            label='Connexion conseiller Mission Locale'
            className='pt-4'
            handleSubmit={(event) => handleSubmit(event, 'similo-conseiller')}
          />
          <FormButton
            label='Connexion conseiller Pôle emploi'
            className='pt-4'
            handleSubmit={(event) => handleSubmit(event, 'pe-conseiller')}
          />

          {errorMsg && <p className='error'>{errorMsg}</p>}
        </div>
      </div>
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
      ssoPassEmploiEstActive: process.env.ENABLE_PASS_EMPLOI_SSO,
      isFromEmail: isFromEmail,
    },
  }
}

export default withTransaction(Login.name, 'page')(Login)

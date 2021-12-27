import Button from 'components/Button'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import { getSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useState } from 'react'
import Logo from '../assets/icons/logo_PassEmploiBig.svg'

const Login = () => {
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  const signin = useCallback(
    async (provider?: string) => {
      try {
        const redirectUrl = (router.query.redirectUrl as string) ?? '/'
        signIn(
          'keycloak',
          { callbackUrl: redirectUrl },
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
    const provider = router.query.provider
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

  return (
    <div className='bg-bleu_blanc w-full h-screen relative'>
      <div className='absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4'>
        <div className='mb-[104px]'>
          <Logo
            role='img'
            focusable='false'
            aria-label='Logo de Pass Emploi'
            className='m-auto'
          />
        </div>

        <div className='bg-blanc px-[122px] py-[48px] rounded-x_large'>
          <h1 className='text-lg-semi text-bleu_nuit text-center mb-[48px]'>
            Connectez-vous à l&apos;espace conseiller
          </h1>

          <form onSubmit={handleSubmit}>
            <Button type='submit' className='w-full'>
              <span className='w-full'>Connexion</span>
            </Button>
          </form>

          <form
            onSubmit={(event) => handleSubmit(event, 'similo-conseiller')}
            className='pt-4'
          >
            <Button type='submit' className='w-full'>
              <span className='w-full'>Connexion avec Mission locale</span>
            </Button>
          </form>

          <form
            onSubmit={(event) => handleSubmit(event, 'pe-conseiller')}
            className='pt-4'
          >
            <Button type='submit' className='w-full'>
              <span className='w-full'>Connexion avec Pôle emploi</span>
            </Button>
          </form>

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
  if (session) {
    const redirectUrl: string = (context.query.redirectUrl as string) ?? '/'
    return {
      redirect: {
        destination: redirectUrl,
        permanent: false,
      },
    }
  }

  return { props: {} }
}

export default Login

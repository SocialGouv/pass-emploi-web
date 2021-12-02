import Button from 'components/Button'
import React, { useState } from 'react'

import { signIn } from 'next-auth/react'

import Logo from '../assets/icons/logo_PassEmploiBig.svg'
import { useRouter } from 'next/router'

const Login = () => {
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  async function handleSubmit(event: any) {
    event.preventDefault()

    try {
      const { redirectUrl } = router.query
      signIn('keycloak', { callbackUrl: redirectUrl as string })
    } catch (error) {
      console.error(error)
      setErrorMsg("une erreur est survenue lors de l'authentification")
    }
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
            <Button type='submit' className='m-auto'>
              <span className='px-[42px]'>Connexion</span>
            </Button>
          </form>

          {errorMsg && <p className='error'>{errorMsg}</p>}
        </div>
      </div>
    </div>
  )
}

export default Login

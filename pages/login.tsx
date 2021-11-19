import { signIn } from 'next-auth/react'
import React from 'react'

import Logo from '../assets/icons/logo_PassEmploiBig.svg'

const Login = () => {
  signIn('keycloak')

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
            Connexion en cours...
          </h1>
        </div>
      </div>
    </div>
  )
}

export default Login

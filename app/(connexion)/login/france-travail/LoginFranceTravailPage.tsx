'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React from 'react'

import LoginHeader from 'components/LoginHeader'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import { signin } from 'utils/auth/auth'
import { useLoginErrorMessage } from 'utils/auth/loginErrorMessageContext'

function LoginFranceTravailPage() {
  const [errorMsg, setErrorMsg] = useLoginErrorMessage()
  const searchParams = useSearchParams()

  async function handleSignin() {
    await signin(
      'ft-conseiller',
      setErrorMsg,
      searchParams.get('redirectUrl') ?? undefined
    )
  }

  return (
    <>
      <LoginHeader title='Connexion conseiller France Travail' />

      <main role='main'>
        {errorMsg && <FailureAlert label={errorMsg} />}

        <div className='grid grid-cols-2'>
          <div className='p-14 pb-20 rounded-l border border-primary_lighten text-center'>
            <span
              id='connexion-unique--description'
              className='text-m-regular text-primary_darken'
            >
              Vous avez déjà un compte ?
            </span>
            <button
              type='button'
              aria-label='Connexion France Travail'
              aria-describedby='connexion-unique--description'
              onClick={handleSignin}
              className='mt-4 w-full py-4 rounded-full bg-primary_darken text-l-bold text-white hover:bg-primary_darken_strong'
            >
              Connexion
            </button>
          </div>

          <div className='grow rounded-l border border-primary_lighten flex justify-center items-center'>
            <Link
              href='/login/france-travail/dispositifs'
              className='text-m-regular underline text-primary_darken'
            >
              Première visite ?
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}

export default withTransaction(
  LoginFranceTravailPage.name,
  'page'
)(LoginFranceTravailPage)

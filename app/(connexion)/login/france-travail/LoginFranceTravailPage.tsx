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

        <div className='flex flex-wrap gap-2'>
          <div className='flex-[1_1_300px] py-16 rounded-large border border-primary-lighten text-center'>
            <span
              id='connexion-unique--description'
              className='text-m-regular text-primary-darken'
            >
              Vous avez déjà un compte ?
            </span>
            <button
              type='button'
              aria-label='Connexion France Travail'
              aria-describedby='connexion-unique--description'
              onClick={handleSignin}
              className='block mx-auto mt-4 w-fit py-4 px-8 rounded-large bg-primary-darken text-l-bold text-white hover:bg-primary-darken-strong'
            >
              Connexion
            </button>
          </div>

          <div className='flex-[1_1_300px] rounded-large border border-primary-lighten flex justify-center items-center'>
            <Link
              href='/login/france-travail/dispositifs'
              className='text-m-regular underline text-primary-darken hover:text-primary-darken-strong'
            >
              Première visite&nbsp;?
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

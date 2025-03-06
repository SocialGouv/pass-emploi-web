'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { useSearchParams } from 'next/navigation'
import React from 'react'

import IllustrationLogoCD from 'assets/images/logo-cd.svg'
import IllustrationLogoFT from 'assets/images/logo-ft.svg'
import IllustrationLogoMilo from 'assets/images/logo-milo.svg'
import LoginHeader from 'components/LoginHeader'
import LoginButton from 'components/ui/Button/LoginButton'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import { signin } from 'utils/auth/auth'
import { useLoginErrorMessage } from 'utils/auth/loginErrorMessageContext'

function LoginHubPage() {
  const [errorMsg, setErrorMsg] = useLoginErrorMessage()
  const searchParams = useSearchParams()

  async function handleSignin(provider: string) {
    await signin(
      provider,
      setErrorMsg,
      searchParams.get('redirectUrl') ?? undefined
    )
  }

  return (
    <>
      <LoginHeader
        title='Bienvenue sur le portail CEJ et Pass emploi'
        subtitle='À quelle structure appartenez-vous ?'
      />

      <main role='main'>
        {errorMsg && <FailureAlert label={errorMsg} />}

        <ul className='m-auto flex flex-col gap-8 max-w-[400px]'>
          <li>
            <LoginButton
              label='Mission locale'
              onClick={() => handleSignin('similo-conseiller')}
              Illustration={IllustrationLogoMilo}
            />
          </li>
          <li>
            <LoginButton
              label='France Travail'
              href='/login/france-travail'
              Illustration={IllustrationLogoFT}
            />
          </li>
          <li>
            <LoginButton
              label='Conseil départemental'
              onClick={() => handleSignin('conseildepartemental-conseiller')}
              Illustration={IllustrationLogoCD}
            />
          </li>
        </ul>
      </main>
    </>
  )
}

export default withTransaction(LoginHubPage.name, 'page')(LoginHubPage)

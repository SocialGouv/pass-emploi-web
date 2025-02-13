'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { useSearchParams } from 'next/navigation'
import React from 'react'

import LoginHeader from 'components/LoginHeader'
import LoginButton from 'components/ui/Button/LoginButton'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import { signin } from 'utils/auth/auth'
import { useLoginErrorMessage } from 'utils/auth/loginErrorMessageContext'

type LoginFranceTravailDispositifsPageProps = {
  ssoAvenirProEstActif?: boolean
}

function LoginFranceTravailDispositifsPage({
  ssoAvenirProEstActif,
}: LoginFranceTravailDispositifsPageProps) {
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
        title='Connexion conseiller France Travail'
        subtitle='Choisissez votre dispositif'
      />

      <main role='main'>
        {errorMsg && <FailureAlert label={errorMsg} />}

        <ul className='grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] auto-rows-fr gap-8'>
          <li>
            <LoginButton
              label='CEJ'
              prefix='France Travail'
              onClick={() => handleSignin('pe-conseiller')}
            />
          </li>
          <li>
            <LoginButton
              label='RSA rénové'
              prefix='France Travail'
              onClick={() => handleSignin('pe-brsa-conseiller')}
            />
          </li>
          <li>
            <LoginButton
              label='AIJ'
              prefix='France Travail'
              onClick={() => handleSignin('pe-aij-conseiller')}
            />
          </li>
          {ssoAvenirProEstActif && (
            <li>
              <LoginButton
                label='Avenir pro'
                prefix='France Travail'
                onClick={() => handleSignin('avenirpro-conseiller')}
              />
            </li>
          )}
        </ul>
      </main>
    </>
  )
}

export default withTransaction(
  LoginFranceTravailDispositifsPage.name,
  'page'
)(LoginFranceTravailDispositifsPage)

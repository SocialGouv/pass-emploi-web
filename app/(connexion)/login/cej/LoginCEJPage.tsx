'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { useSearchParams } from 'next/navigation'
import React, { FormEvent } from 'react'

import { signin } from 'app/(connexion)/login/layout'
import LienRetour from 'components/LienRetour'
import { ButtonStyle } from 'components/ui/Button/Button'
import LoginButton from 'components/ui/Button/LoginButton'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import { useLoginErrorMessage } from 'utils/auth/loginErrorMessageContext'

function LoginCEJPage() {
  const [errorMsg, setErrorMsg] = useLoginErrorMessage()
  const searchParams = useSearchParams()

  async function handleSignin(event: FormEvent, provider?: string) {
    event.preventDefault()
    await signin(searchParams, setErrorMsg, provider)
  }

  return (
    <div className='grow flex flex-col justify-center bg-primary_lighten'>
      <div className='mx-auto relative'>
        {errorMsg && <FailureAlert label={errorMsg} />}

        <div className='flex flex-col px-6 py-12 bg-white rounded-l shadow-m'>
          <div className='self-end'>
            <LienRetour returnUrlOrPath='/login' />
          </div>
          <header role='banner'>
            <IllustrationComponent
              name={IllustrationName.LogoCEJ}
              className='m-auto h-[90px] fill-primary_darken'
              focusable={false}
              aria-hidden={true}
            />
            <h1 className='text-xl-bold text-primary_darken text-center my-6 mx-4'>
              Connexion conseiller
            </h1>
          </header>

          <main>
            <ul className='px-6 pt-6 flex flex-col gap-4'>
              <li>
                <LoginButton
                  label='Connexion Mission Locale'
                  style={ButtonStyle.SECONDARY}
                  illustrationName={IllustrationName.LogoMilo}
                  className='whitespace-nowrap'
                  handleSubmit={(event) =>
                    handleSignin(event, 'similo-conseiller')
                  }
                />
              </li>
              <li>
                <LoginButton
                  label='Connexion France Travail'
                  style={ButtonStyle.SECONDARY}
                  illustrationName={IllustrationName.LogoFT}
                  className='whitespace-nowrap'
                  handleSubmit={(event) => handleSignin(event, 'pe-conseiller')}
                />
              </li>
            </ul>
          </main>
        </div>
      </div>
    </div>
  )
}

export default withTransaction(LoginCEJPage.name, 'page')(LoginCEJPage)

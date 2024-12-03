'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { useSearchParams } from 'next/navigation'
import React, { FormEvent } from 'react'

import LienRetour from 'components/LienRetour'
import { ButtonStyle } from 'components/ui/Button/Button'
import LoginButton from 'components/ui/Button/LoginButton'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import { signin } from 'utils/auth/auth'
import { useLoginErrorMessage } from 'utils/auth/loginErrorMessageContext'

function LoginPage() {
  const [errorMsg, setErrorMsg] = useLoginErrorMessage()
  const searchParams = useSearchParams()

  async function handleSignin(event: FormEvent, provider: string) {
    event.preventDefault()
    await signin(
      provider,
      setErrorMsg,
      searchParams.get('redirectUrl') ?? undefined
    )
  }

  return (
    <div className='grow flex flex-col justify-center bg-primary_lighten'>
      <div className='mx-auto relative'>
        {errorMsg && <FailureAlert label={errorMsg} />}

        <div className='flex flex-col px-6 py-12 bg-white rounded-l shadow-m'>
          <header role='banner' className='flex flex-col'>
            <div className='self-end'>
              <LienRetour returnUrlOrPath='/login' />
            </div>
            <h1 className='text-center mt-4 mb-6'>
              <IllustrationComponent
                name={IllustrationName.LogoPassemploi}
                className='m-auto h-[90px] fill-primary_darken'
                focusable={false}
                aria-hidden={true}
              />
              <span className='sr-only'>Connexion conseiller pass emploi</span>
            </h1>
          </header>

          <main
            role='main'
            className='grid grid-cols-1 layout_s:grid-rows-[repeat(2,auto)] layout_s:grid-flow-col layout_s:auto-cols-fr'
          >
            <h2 className='text-l-bold text-primary_darken text-center my-6 mx-4'>
              Connexion conseiller RSA
            </h2>
            <ul className='px-6 pt-6 flex flex-col gap-4 layout_s:border-r-2 layout_s:border-grey_100 '>
              <li>
                <LoginButton
                  altText='France Travail RSA'
                  label='France Travail'
                  illustrationName={IllustrationName.LogoFT}
                  className='whitespace-nowrap'
                  style={ButtonStyle.SECONDARY}
                  handleSubmit={(event) =>
                    handleSignin(event, 'pe-brsa-conseiller')
                  }
                />
              </li>

              <li>
                <LoginButton
                  label='Conseil départemental'
                  className='whitespace-nowrap'
                  style={ButtonStyle.SECONDARY}
                  illustrationName={IllustrationName.LogoCD}
                  handleSubmit={(event) =>
                    handleSignin(event, 'conseildepartemental-conseiller')
                  }
                />
              </li>
            </ul>

            <h2 className='text-l-bold text-primary_darken text-center my-6 mx-4'>
              Connexion conseiller AIJ
            </h2>
            <ul className='px-6 pt-6 flex flex-col gap-4 layout_s:border-r-2 layout_s:border-grey_100'>
              <li>
                <LoginButton
                  altText='France Travail AIJ'
                  label='France Travail'
                  className='whitespace-nowrap'
                  style={ButtonStyle.SECONDARY}
                  illustrationName={IllustrationName.LogoFT}
                  handleSubmit={(event) =>
                    handleSignin(event, 'pe-aij-conseiller')
                  }
                />
              </li>
            </ul>

            <h2 className='text-l-bold text-primary_darken text-center my-6 mx-4'>
              Connexion conseiller Avenir Pro
            </h2>
            <ul className='px-6 pt-6 flex flex-col gap-4'>
              <li>
                <LoginButton
                  altText='France Travail Avenir Pro'
                  label='France Travail'
                  className='whitespace-nowrap'
                  style={ButtonStyle.SECONDARY}
                  illustrationName={IllustrationName.LogoFT}
                  handleSubmit={(event) =>
                    handleSignin(event, 'avenirpro-conseiller')
                  }
                />
              </li>
            </ul>
          </main>
        </div>
      </div>
    </div>
  )
}

export default withTransaction(LoginPage.name, 'page')(LoginPage)

'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { useSearchParams } from 'next/navigation'
import React, { FormEvent, useState } from 'react'

import { signin } from 'app/(connexion)/login/layout'
import LienRetour from 'components/LienRetour'
import { ButtonStyle } from 'components/ui/Button/Button'
import LoginButton from 'components/ui/Button/LoginButton'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import { useLoginErrorMessage } from 'utils/auth/loginErrorMessageContext'

interface LoginProps {
  ssoFranceTravailBRSAEstActif?: boolean
  ssoFranceTravailAIJEstActif?: boolean
  ssoConseillerDeptEstActif?: boolean
}

function LoginPage({
  ssoFranceTravailBRSAEstActif,
  ssoFranceTravailAIJEstActif,
  ssoConseillerDeptEstActif,
}: LoginProps) {
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

          <main className='grid grid-cols-1 layout_s:grid-rows-[repeat(2,auto)] layout_s:grid-flow-col layout_s:auto-cols-fr'>
            <h2 className='text-l-bold text-primary_darken text-center my-6 mx-4'>
              Connexion conseiller RSA
            </h2>
            <ul className='px-6 pt-6 flex flex-col gap-4 layout_s:border-r-2 layout_s:border-grey_100 '>
              {ssoFranceTravailBRSAEstActif && (
                <li>
                  <LoginButton
                    label='Connexion BRSA'
                    illustrationName={IllustrationName.LogoFT}
                    className='whitespace-nowrap'
                    style={ButtonStyle.SECONDARY}
                    handleSubmit={(event) =>
                      handleSignin(event, 'pe-brsa-conseiller')
                    }
                  />
                </li>
              )}
              {ssoConseillerDeptEstActif && (
                <li>
                  <LoginButton
                    label='Connexion conseil départemental'
                    className='whitespace-nowrap'
                    style={ButtonStyle.SECONDARY}
                    illustrationName={IllustrationName.LogoCD}
                    handleSubmit={(event) =>
                      handleSignin(event, 'conseildepartemental-conseiller')
                    }
                  />
                </li>
              )}
            </ul>

            <h2 className='text-l-bold text-primary_darken text-center my-6 mx-4'>
              Connexion conseiller AIJ
            </h2>
            <ul className='px-6 pt-6 flex flex-col gap-4'>
              {ssoFranceTravailAIJEstActif && (
                <li>
                  <LoginButton
                    label='Connexion AIJ'
                    className='whitespace-nowrap'
                    style={ButtonStyle.SECONDARY}
                    illustrationName={IllustrationName.LogoFT}
                    handleSubmit={(event) =>
                      handleSignin(event, 'pe-aij-conseiller')
                    }
                  />
                </li>
              )}
            </ul>
          </main>
        </div>
      </div>
    </div>
  )
}

export default withTransaction(LoginPage.name, 'page')(LoginPage)

'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import Link from 'next/link'
import React from 'react'

import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import { useLoginErrorMessage } from 'utils/auth/loginErrorMessageContext'

function LoginHubPage() {
  const [errorMsg] = useLoginErrorMessage()

  return (
    <div className='grow flex flex-col justify-center bg-primary_lighten'>
      <div className='bg-white rounded-l shadow-m px-12 py-12 mx-auto relative'>
        <header role='banner' className='mb-6'>
          <h1 className='text-xl-bold text-primary_darken text-center mb-6'>
            Connectez-vous à l&apos;espace conseiller
          </h1>
          <p className='text-m-regular text-primary_darken text-center'>
            Sélectionnez votre application
          </p>
        </header>

        <main className='flex flex-col gap-4'>
          {errorMsg && <FailureAlert label={errorMsg} />}

          <Link
            className='flex items-center justify-center border-2 border-primary p-2 rounded-base'
            href='/login/cej'
          >
            <span className='sr-only'>
              Se connecter à l’application du contrat d’engagement jeune
            </span>
            <IllustrationComponent
              name={IllustrationName.LogoCEJ}
              className='m-auto h-[90px] fill-primary_darken'
              focusable={false}
              aria-hidden={true}
            />
          </Link>

          <Link
            className='flex items-center justify-center border-2 border-primary p-2 rounded-base'
            href='/login/passemploi'
          >
            <span className='sr-only'>
              Se connecter à l’application pass emploi
            </span>
            <IllustrationComponent
              name={IllustrationName.LogoPassemploi}
              className='m-auto h-[90px] fill-primary_darken'
              focusable={false}
              aria-hidden={true}
            />
          </Link>
        </main>
      </div>
    </div>
  )
}

export default withTransaction(LoginHubPage.name, 'page')(LoginHubPage)

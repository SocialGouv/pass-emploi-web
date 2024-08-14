'use client'

import { withTransaction } from '@elastic/apm-rum-react'

import ButtonLink from '../../components/ui/Button/ButtonLink'

type AuthErrorPageProps = {
  erreur: string
  codeErreur: string | undefined
  lienFormulaire: string | undefined
}
function AuthErrorPage({
  erreur,
  codeErreur,
  lienFormulaire,
}: AuthErrorPageProps) {
  return (
    <>
      <header>
        <title>Portail de connexion</title>
      </header>

      <main className='flex flex-col justify-center p-10 mt-32 w-screen'>
        <div className='shadow-m flex flex-col justify-center w-9/10 mx-auto p-8'>
          <h1 className='text-m-bold text-primary text-center mt-6 mb-8'>
            Portail de connexion
          </h1>
          <div className='text-center text-s'>
            {erreur.split('\n').map((line, index) => (
              <span
                key={index}
                className={
                  index === 0
                    ? 'block text-center'
                    : 'block relative left-1/2 transform -translate-x-1/2 text-left'
                }
              >
                {line}
                <br />
              </span>
            ))}
            {codeErreur && <p className='text-xs m-6'>code : {codeErreur}</p>}
            {lienFormulaire && (
              <ButtonLink href={lienFormulaire}>
                Contacter le support
              </ButtonLink>
            )}
          </div>

          {/* <ExternalLink
            href={'mailto:' + process.env.NEXT_PUBLIC_SUPPORT_MAIL}
            label={'contacter le support'}
            iconName={IconName.OutgoingMail}
            onClick={trackContacterSupportClick}
          /> */}
        </div>
      </main>
    </>
  )
}

export default withTransaction(AuthErrorPage.name, 'page')(AuthErrorPage)

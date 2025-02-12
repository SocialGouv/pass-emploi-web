'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import React from 'react'

import { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import { IconName } from 'components/ui/IconComponent'
import ExternalLink from 'components/ui/Navigation/ExternalLink'
import { StructureConseiller } from 'interfaces/conseiller'
import { trackEvent } from 'utils/analytics/matomo'

type AuthErrorPageProps = {
  erreur: string
  codeErreur?: string
  withStructure?: {
    structure: StructureConseiller
    lienFormulaire?: string
    withTuto?: boolean
  }
}
function AuthErrorPage({
  erreur,
  codeErreur,
  withStructure,
}: AuthErrorPageProps) {
  function trackTutoSuppression() {
    trackEvent({
      structure: withStructure!.structure,
      categorie: 'Tutoriel',
      action: 'Suppression compte',
      nom: '',
      aDesBeneficiaires: null,
    })
  }

  function trackContactSupport() {
    trackEvent({
      structure: withStructure!.structure,
      categorie: 'Contact Support',
      action: 'Connexion',
      nom: '',
      aDesBeneficiaires: null,
    })
  }

  return (
    <>
      <header>
        <title>Portail de connexion</title>
      </header>

      <main
        role='main'
        className='flex flex-col justify-center p-10 mt-32 w-screen'
      >
        <div className='shadow-m flex flex-col justify-center w-9/10 mx-auto p-8'>
          <h1 className='text-m-bold text-primary text-center mt-6 mb-8'>
            Portail de connexion
          </h1>
          <div className='text-center text-s'>
            {erreur.split('\n').map((line, index) => (
              <span key={index}>
                {line}
                <br />
              </span>
            ))}
            {codeErreur && <p className='text-xs mt-6'>code : {codeErreur}</p>}

            {withStructure?.withTuto && (
              <div className='mt-4'>
                <ExternalLink
                  href='https://doc.pass-emploi.beta.gouv.fr/suppression-de-compte/'
                  label='Visionnez le tuto de suppression de compte'
                  onClick={trackTutoSuppression}
                />
              </div>
            )}

            {withStructure?.lienFormulaire && (
              <ButtonLink
                href={withStructure.lienFormulaire}
                style={ButtonStyle.PRIMARY}
                externalIcon={IconName.OpenInNew}
                label='Contacter le support'
                className='m-auto w-fit mt-4'
                onClick={trackContactSupport}
              />
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

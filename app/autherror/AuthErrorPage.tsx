'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import React from 'react'

import { IconName } from 'components/ui/IconComponent'
import ExternalLink from 'components/ui/Navigation/ExternalLink'
import { StructureConseiller } from 'interfaces/conseiller'
import { trackEvent, trackEventBeneficiaire } from 'utils/analytics/matomo'

type AuthErrorPageProps = {
  erreur: string
  utilisateur: {
    type?: 'beneficiaire' | 'conseiller'
    structure?: StructureConseiller
  }
}
function AuthErrorPage({ erreur, utilisateur }: AuthErrorPageProps) {
  function trackContacterSupportClick() {
    if (!utilisateur.type || !utilisateur.structure) return

    if (utilisateur.type === 'conseiller')
      trackEvent({
        structure: utilisateur.structure,
        categorie: 'Contact Support',
        action: 'Auth',
        nom: '',
        aDesBeneficiaires: null,
      })

    if (utilisateur.type === 'beneficiaire')
      trackEventBeneficiaire({
        structure: utilisateur.structure,
        categorie: 'Contact Support',
        action: 'Auth',
        nom: '',
      })
  }

  return (
    <div className='shadow-m'>
      <header>
        <h1 className='text-m-bold text-primary text-center mt-[48px] mb-[24px]'>
          Pass Emploi Connect
        </h1>
      </header>

      <main>
        <p>{erreur}</p>

        <ExternalLink
          href={'mailto:' + process.env.NEXT_PUBLIC_SUPPORT_MAIL}
          label={'contacter le support'}
          iconName={IconName.OutgoingMail}
          onClick={trackContacterSupportClick}
        />
      </main>
    </div>
  )
}

export default withTransaction(AuthErrorPage.name, 'page')(AuthErrorPage)

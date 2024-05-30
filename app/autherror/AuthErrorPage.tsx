'use client'

import { withTransaction } from '@elastic/apm-rum-react'

import { StructureConseiller } from 'interfaces/conseiller'
import { trackEvent, trackEventBeneficiaire } from 'utils/analytics/matomo'

type AuthErrorPageProps = {
  erreur: string
  utilisateur: {
    type?: 'JEUNE' | 'CONSEILLER'
    structure?: StructureConseiller
  }
}
function AuthErrorPage({ erreur, utilisateur }: AuthErrorPageProps) {
  function trackContacterSupportClick() {
    if (!utilisateur.type || !utilisateur.structure) return

    if (utilisateur.type === 'CONSEILLER')
      trackEvent({
        structure: utilisateur.structure,
        categorie: 'Contact Support',
        action: 'Auth',
        nom: '',
        aDesBeneficiaires: null,
      })

    if (utilisateur.type === 'JEUNE')
      trackEventBeneficiaire({
        structure: utilisateur.structure,
        categorie: 'Contact Support',
        action: 'Auth',
        nom: '',
      })
  }

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
          <p className='text-center text-s'>{erreur}</p>

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

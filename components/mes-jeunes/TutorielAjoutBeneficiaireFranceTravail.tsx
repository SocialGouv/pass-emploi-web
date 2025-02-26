import React from 'react'

import EtapesTutoAjoutBeneficiaire from 'components/mes-jeunes/EtapesTutoAjoutBeneficiaire'
import { IconName } from 'components/ui/IconComponent'
import ExternalLink from 'components/ui/Navigation/ExternalLink'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { Structure } from 'interfaces/structure'
import { trackEvent } from 'utils/analytics/matomo'

export default function TutorielAjoutBeneficiaireFranceTravail({
  structure,
}: {
  structure: Structure
}) {
  const etapes = [
    {
      icon: IconName.NumberCircleOne,
      texte: 'Cliquez sur « Ajouter un bénéficiaire ».',
    },
    {
      icon: IconName.NumberCircleTwo,
      texte: 'Renseignez le nom, prénom et l’adresse e-mail du bénéficiaire.',
    },
    {
      icon: IconName.NumberCircleThree,
      texte: 'Cliquez sur « créer le compte ».',
    },
    {
      icon: IconName.NumberCircleFour,
      texte:
        'Le bénéficiaire peut alors télécharger et installer l’application sur son téléphone.',
    },
    {
      icon: IconName.NumberCircleFive,
      texte:
        'Il se connecte avec ses identifiants France Travail (nom d’utilisateur et mot de passe).',
    },
  ]

  function trackTutoSuppression() {
    trackEvent({
      structure,
      categorie: 'Tutoriel',
      action: 'Suppression compte',
      nom: '',
      aDesBeneficiaires: null,
    })
  }

  return (
    <>
      <EtapesTutoAjoutBeneficiaire etapes={etapes} />
      <InformationMessage label='Vous avez changé de dispositif ?'>
        <ExternalLink
          label='Consultez la procédure à suivre'
          href='https://doc.pass-emploi.beta.gouv.fr/suppression-de-compte/'
          onClick={trackTutoSuppression}
        />
      </InformationMessage>
    </>
  )
}

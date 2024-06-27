import React from 'react'

import EtapesTutoAjoutBeneficiaire from 'components/mes-jeunes/EtapesTutoAjoutBeneficiaire'
import { IconName } from 'components/ui/IconComponent'
import InformationMessage from 'components/ui/Notifications/InformationMessage'

export default function TutorielAjoutBeneficiaireFranceTravail() {
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

  return (
    <>
      <EtapesTutoAjoutBeneficiaire etapes={etapes} />
      <InformationMessage label='Attention à bien renseigner l’e-mail qui se trouve sous le dossier MAP du bénéficiaire.' />
    </>
  )
}

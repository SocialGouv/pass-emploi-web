import React from 'react'

import EtapesTutoAjoutBeneficiaire from 'components/mes-jeunes/EtapesTutoAjoutBeneficiaire'
import { IconName } from 'components/ui/IconComponent'
import InformationMessage from 'components/ui/Notifications/InformationMessage'

export default function TutorielAjoutBeneficiaireMilo() {
  const etapes = [
    {
      icon: IconName.NumberCircleOne,
      texte: 'Cliquer sur « Ajouter un bénéficiaire ».',
    },
    {
      icon: IconName.NumberCircleTwo,
      texte: (
        <>
          Munissez vous du numéro de{' '}
          <em>dossier i-milo associé à ce compte.</em> Pour le retrouver, ouvrez
          le dossier du bénéficiaire dans i-milo et copiez coller le numéro
          indiqué dans la barre d’adresse.
        </>
      ),
    },
    {
      icon: IconName.NumberCircleThree,
      texte:
        'Saisissez ce numéro de dossier i-milo dans le formulaire puis validez.',
    },
    {
      icon: IconName.NumberCircleFour,
      texte: (
        <>
          Le bénéficiaire va ensuite recevoir par e-mail un{' '}
          <em>
            lien d’activation envoyé par i-milo. Ce lien est valide 12 heures.
          </em>
        </>
      ),
    },
    {
      icon: IconName.NumberCircleFive,
      texte: 'L’envoi du mail par i-milo peut ne pas être instantané.',
    },
  ]

  return (
    <>
      <EtapesTutoAjoutBeneficiaire etapes={etapes} />
      <InformationMessage label='À noter'>
        <p className='mb-2'>
          L’email peut parfois arriver dans les{' '}
          <span className='text-base-bold'>spams du bénéficiaire</span>. Pensez
          à lui demander de les vérifier. Ils peuvent également rechercher dans
          leur boîte l’émetteur de l’email, qui est{' '}
          <span className='text-base-bold'>ne-pas-repondre@qlf.i-milo.fr.</span>
        </p>
        <p>
          Si le jeune ne reçoit pas cet email, il peut en recevoir un nouveau en
          allant sur l’application, cliquant sur «
          <span className='text-base-bold'>
            Je suis suivi par Mission locale
          </span>{' '}
          », et en cliquant sur «{' '}
          <span className='text-base-bold'>Mot de passe oublié ?</span>
          ».
        </p>
      </InformationMessage>
    </>
  )
}

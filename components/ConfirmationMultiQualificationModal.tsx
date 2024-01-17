import { MouseEvent, useRef } from 'react'

import Modal from './Modal'
import ExternalLink from './ui/Navigation/ExternalLink'
import InformationMessage from './ui/Notifications/InformationMessage'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { ActionPilotage } from 'interfaces/action'

interface ConfirmationMultiQualificationModalProps {
  actions: ActionPilotage[]
  onConfirmation: () => void
  onCancel: () => void
  onLienExterne: (label: string) => void
}

export default function ConfirmationMultiQualificationModal({
  actions,
  onCancel,
  onConfirmation,
  onLienExterne,
}: ConfirmationMultiQualificationModalProps) {
  const modalRef = useRef<{
    closeModal: (e: KeyboardEvent | MouseEvent) => void
  }>(null)

  const titreModale = `Qualifier ${
    actions.length > 1 ? `les ${actions.length} actions` : 'l’action'
  } de ${actions[0].beneficiaire.prenom} ${
    actions[0].beneficiaire.nom
  } en SNP ?`

  return (
    <Modal title={titreModale} onClose={onCancel} ref={modalRef}>
      <div className='px-10 text-center'>
        <p className='mt-6 text-base-bold'>
          Les informations seront envoyées à i-milo, qui comptera
          automatiquement les heures associées à chaque type de SNP.
        </p>
      </div>

      <div className='my-14 flex justify-center'>
        <Button
          type='button'
          style={ButtonStyle.SECONDARY}
          onClick={(e) => modalRef.current!.closeModal(e)}
          className='mr-3'
        >
          Annuler
        </Button>
        <Button type='button' onClick={onConfirmation}>
          Qualifier et envoyer à i-milo
        </Button>
      </div>

      <InformationMessage label='Ces informations seront intégrées sur le dossier i-milo du bénéficiaire.'>
        <p>
          Les informations saisies sont partagées avec i-milo, et doivent en
          respecter les Conditions Générales d’utilisation. Elles ne doivent
          comporter aucune donnée personnelle non autorisée par l’arrêté du 17
          novembre 2021 relatif au traitement automatisé de données à caractère
          personnel dénommé « i-milo »
        </p>
        <ExternalLink
          href='https://c-milo.i-milo.fr/jcms/t482_1002488/fr/mentions-legales'
          label='Voir le détail des CGU'
          onClick={() => {
            onLienExterne('Lien CGU')
          }}
        />
        <ExternalLink
          href='https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000045084361'
          label='Voir le détail de l’arrêté du 17 novembre 2021'
          onClick={() => {
            onLienExterne('Lien Arrêté 17 novembre 2021')
          }}
        />
      </InformationMessage>
    </Modal>
  )
}

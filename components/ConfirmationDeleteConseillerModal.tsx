import { useRef } from 'react'

import Modal, { ModalHandles } from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import { Conseiller } from 'interfaces/conseiller'
import { Structure } from 'interfaces/structure'

interface ConfirmationDeleteConseillerModalProps {
  onConfirmation: () => void
  onCancel: () => void
  conseiller: Conseiller
  portefeuilleAvecBeneficiaires: boolean
}

export default function ConfirmationDeleteConseillerModal({
  onCancel,
  onConfirmation,
  conseiller,
  portefeuilleAvecBeneficiaires,
}: ConfirmationDeleteConseillerModalProps) {
  const modalRef = useRef<ModalHandles>(null)

  const title = portefeuilleAvecBeneficiaires
    ? 'Pour supprimer votre compte, vos bénéficiaires doivent être transférés à un conseiller.'
    : `Souhaitez-vous supprimer le compte conseiller ${labelStructure(conseiller.structure)}: ${conseiller.firstName} ${conseiller.lastName} ?`
  return (
    <Modal
      title={title}
      onClose={onCancel}
      ref={modalRef}
      titleIllustration={
        portefeuilleAvecBeneficiaires
          ? IllustrationName.ArrowForward
          : IllustrationName.Delete
      }
    >
      <div className='px-20 text-center'>
        {!portefeuilleAvecBeneficiaires && (
          <p className='mt-6'>L’ensemble des données sera supprimé.</p>
        )}
        {portefeuilleAvecBeneficiaires && (
          <p className='mt-6'>Veuillez contacter votre superviseur.</p>
        )}
      </div>

      <div className='mt-4 flex justify-center'>
        {!portefeuilleAvecBeneficiaires && (
          <>
            <Button
              type='button'
              style={ButtonStyle.SECONDARY}
              onClick={(e) => modalRef.current!.closeModal(e)}
              className='mr-3'
            >
              Annuler
            </Button>
            <Button type='button' onClick={onConfirmation}>
              Supprimer le compte
            </Button>
          </>
        )}
        {portefeuilleAvecBeneficiaires && (
          <Button
            type='button'
            style={ButtonStyle.PRIMARY}
            onClick={(e) => modalRef.current!.closeModal(e)}
            className='mr-3'
          >
            Fermer
          </Button>
        )}
      </div>
    </Modal>
  )
}

function labelStructure(structure: Structure): string {
  switch (structure) {
    case 'AVENIR_PRO':
      return 'avenir pro'
    case 'CONSEIL_DEPT':
      return 'départemental'
    case 'POLE_EMPLOI_BRSA':
      return 'BRSA'
    case 'POLE_EMPLOI_AIJ':
      return 'AIJ'
    case 'FT_ACCOMPAGNEMENT_INTENSIF':
      return 'REN-Intensif'
    case 'FT_ACCOMPAGNEMENT_GLOBAL':
      return 'Accompagnement global'
    case 'FT_EQUIP_EMPLOI_RECRUT':
      return 'Equip’emploi / Equip’recrut'
    case 'MILO':
    case 'POLE_EMPLOI':
      return 'CEJ'
  }
}

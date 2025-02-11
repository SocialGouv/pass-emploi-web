import { useRef } from 'react'

import Modal, { ModalHandles } from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import { Conseiller, StructureConseiller } from 'interfaces/conseiller'

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

  const labelStructure = ((): string => {
    switch (conseiller.structure) {
      case StructureConseiller.AVENIR_PRO:
        return 'avenir pro'
      case StructureConseiller.CONSEIL_DEPT:
        return 'départemental'
      case StructureConseiller.POLE_EMPLOI_BRSA:
        return 'BRSA'
      case StructureConseiller.POLE_EMPLOI_AIJ:
        return 'AIJ'
      case StructureConseiller.FT_ACCOMPAGNEMENT_INTENSIF:
        return 'Accompagnement intensif'
      case StructureConseiller.FT_ACCOMPAGNEMENT_GLOBAL:
        return 'Accompagnement global'
      case StructureConseiller.FT_EQUIP_EMPLOI_RECRUT:
        return 'Equip’emploi / Equip’recrut'
      case StructureConseiller.MILO:
      case StructureConseiller.POLE_EMPLOI:
        return 'CEJ'
    }
  })()

  const title = portefeuilleAvecBeneficiaires
    ? 'Pour supprimer votre compte, vos bénéficiaires doivent être transférés à un conseiller.'
    : `Souhaitez-vous supprimer le compte conseiller ${labelStructure}: ${conseiller.firstName} ${conseiller.lastName} ?`
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

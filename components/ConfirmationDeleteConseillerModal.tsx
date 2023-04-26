import { MouseEvent, useRef } from 'react'

import Modal from './Modal'
import { IconName } from './ui/IconComponent'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { Conseiller, estPoleEmploiBRSA } from 'interfaces/conseiller'

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
  const modalRef = useRef<{
    closeModal: (e: KeyboardEvent | MouseEvent) => void
  }>(null)

  const labelStructure = !estPoleEmploiBRSA(conseiller) ? 'CEJ' : 'BRSA'
  return (
    <Modal
      title={`Suppression de votre compte conseiller ${labelStructure} ${conseiller.firstName} ${conseiller.lastName}`}
      titleIcon={IconName.Warning}
      onClose={onCancel}
      ref={modalRef}
    >
      <div className='px-20 text-center'>
        {!portefeuilleAvecBeneficiaires && (
          <InformationMessage label='Attention, cette opération est définitive. Une fois confirmée, toutes les informations liées à votre compte seront supprimées et irrécupérables.' />
        )}
        {portefeuilleAvecBeneficiaires && (
          <InformationMessage label='Afin de procéder à la suppression de votre compte, votre portefeuille doit avoir été transféré. Merci de contacter votre superviseur puis renouveler la suppression.' />
        )}
        {!portefeuilleAvecBeneficiaires && (
          <p className='mt-6'>Souhaitez-vous confirmer la suppression ?</p>
        )}
      </div>

      <div className='mt-14 flex justify-center'>
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
              Confirmer
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
            Retour
          </Button>
        )}
      </div>
    </Modal>
  )
}

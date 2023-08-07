import dynamic from 'next/dynamic'
import { MouseEvent, useRef } from 'react'

import Modal from './Modal'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { Conseiller, estPoleEmploiBRSA } from 'interfaces/conseiller'

const IllustrationDelete = dynamic(
  import('../assets/images/illustration-delete.svg'),
  { ssr: false }
)
const IllustrationArrowForward = dynamic(
  import('../assets/images/illustration-arrow-forward.svg'),
  { ssr: false }
)

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
  const title = portefeuilleAvecBeneficiaires
    ? 'Pour supprimer votre compte, vos bénéficiaires doivent être transférés à un conseiller.'
    : `Souhaitez-vous supprimer le compte conseiller ${labelStructure}: ${conseiller.firstName} ${conseiller.lastName} ?`
  return (
    <Modal
      title={title}
      onClose={onCancel}
      ref={modalRef}
      illustration={
        portefeuilleAvecBeneficiaires ? (
          <IllustrationArrowForward
            focusable='false'
            aria-hidden='true'
            className='w-1/3 m-auto fill-primary mb-8'
          />
        ) : (
          <IllustrationDelete
            focusable='false'
            aria-hidden='true'
            className='w-1/3 m-auto fill-primary mb-8'
          />
        )
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

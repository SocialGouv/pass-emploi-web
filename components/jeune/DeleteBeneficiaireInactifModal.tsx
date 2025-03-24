import React, {
  ForwardedRef,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react'

import Modal, { ModalHandles } from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import { BaseBeneficiaire } from 'interfaces/beneficiaire'
import useMatomo from 'utils/analytics/useMatomo'
import { usePortefeuille } from 'utils/portefeuilleContext'

interface DeleteJeuneInactifModalProps {
  beneficiaire: BaseBeneficiaire
  onClose: () => void
  onDelete: () => Promise<void>
}

function DeleteBeneficiaireInactifModal(
  { beneficiaire, onClose, onDelete }: DeleteJeuneInactifModalProps,
  ref: ForwardedRef<ModalHandles>
) {
  const [portefeuille] = usePortefeuille()

  const modalRef = useRef<ModalHandles>(null)
  useImperativeHandle(ref, () => modalRef.current!)

  useMatomo(
    'Détail Jeune - Pop-in confirmation suppression',
    portefeuille.length > 0
  )

  return (
    <Modal
      ref={modalRef}
      title={`Suppression du compte bénéficiaire ${beneficiaire.prenom} ${beneficiaire.nom}`}
      onClose={onClose}
      titleIllustration={IllustrationName.Delete}
    >
      <p className='mt-6 text-base-regular text-content-color text-center'>
        Une fois confirmée toutes les informations liées à ce compte jeune
        seront supprimées.
      </p>
      <div className='flex justify-center mt-4'>
        <Button
          type='button'
          style={ButtonStyle.SECONDARY}
          onClick={(e) => modalRef.current!.closeModal(e)}
        >
          Annuler
        </Button>
        <Button
          type='button'
          style={ButtonStyle.PRIMARY}
          onClick={onDelete}
          className='ml-6'
        >
          Supprimer le compte
        </Button>
      </div>
    </Modal>
  )
}
export default forwardRef(DeleteBeneficiaireInactifModal)

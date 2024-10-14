import { MouseEvent, useRef } from 'react'

import Modal, { ModalHandles } from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { BaseBeneficiaire } from 'interfaces/beneficiaire'

interface ConfirmationMultiQualificationModalProps {
  actions: Array<{ idAction: string; codeQualification?: string }>
  beneficiaire: BaseBeneficiaire
  onConfirmation: () => void
  onCancel: () => void
}

export default function ConfirmationMultiQualificationModalNonSNP({
  actions,
  beneficiaire,
  onCancel,
  onConfirmation,
}: ConfirmationMultiQualificationModalProps) {
  const modalRef = useRef<ModalHandles>(null)

  const titreModale = `Enregistrer ${
    actions.length > 1 ? `les ${actions.length} actions` : 'l’action'
  } \nde ${beneficiaire.prenom} ${beneficiaire.nom} en non SNP ?`

  async function qualifier(e: MouseEvent<HTMLButtonElement>) {
    modalRef.current!.closeModal(e)
    onConfirmation()
  }

  return (
    <Modal title={titreModale} onClose={onCancel} ref={modalRef}>
      <div className='px-10 text-center'>
        <p className='mt-6 text-base-bold'>
          Les actions non-SNP ne sont pas transmises à i-milo, pour ne pas
          fausser le calcul d’heures de votre bénéficiaire.
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
        <Button type='button' onClick={qualifier}>
          Enregistrer en non SNP
        </Button>
      </div>
    </Modal>
  )
}

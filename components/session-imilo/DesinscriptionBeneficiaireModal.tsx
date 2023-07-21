import React, { MouseEvent, useRef, useState } from 'react'

import RadioBox from 'components/action/RadioBox'
import Modal from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import Textarea from 'components/ui/Form/Textarea'
import { ValueWithError } from 'components/ValueWithError'

interface DesinscriptionBeneficiaireModalProps {
  onConfirmation: () => void
  onCancel: () => void
  beneficiaireName: string
  sessionName: string
}

export default function DesinscriptionBeneficiaireModal({
  onConfirmation,
  onCancel,
  beneficiaireName,
  sessionName,
}: DesinscriptionBeneficiaireModalProps) {
  const refusjeune = 'REFUS_JEUNE'

  const modalRef = useRef<{
    closeModal: (e: KeyboardEvent | MouseEvent) => void
  }>(null)

  const [typeRefus, setTypeRefus] = useState<string | undefined>()
  const [commentaire, setCommentaire] =
    useState<ValueWithError<string | undefined>>()

  function validateCommentaire() {
    if (commentaire?.value?.length > 250) {
      setCommentaire({
        value: commentaire?.value,
        error:
          'Vous avez dépassé le nombre maximal de caractères. Retirez des caractères.',
      })
    }
  }

  return (
    <Modal
      title={`Vous souhaitez désinscrire ${beneficiaireName} de ${sessionName}`}
      onClose={onCancel}
      ref={modalRef}
    >
      <div className='px-20 text-center'>
        <RadioBox
          isSelected={typeRefus === 'INSCRIT'}
          onChange={() => setTypeRefus('INSCRIT')}
          label='Temporaire'
          name='type-reaffectation'
          id='type-reaffectation--temporaire'
        />
      </div>

      {typeRefus === refusjeune && (
        <Textarea
          id='commentaire'
          maxLength={250}
          onChange={(value: string) => setCommentaire({ value: value })}
          onBlur={validateCommentaire}
        />
      )}

      <div className='mt-14 flex justify-center'>
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
      </div>
    </Modal>
  )
}

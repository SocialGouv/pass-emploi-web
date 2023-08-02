import React, { FormEvent, MouseEvent, useRef, useState } from 'react'

import RadioBox from 'components/action/RadioBox'
import Modal from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import Textarea from 'components/ui/Form/Textarea'
import { ValueWithError } from 'components/ValueWithError'
import { StatutBeneficiaire } from 'interfaces/session'
import { BaseBeneficiaireASelectionner } from 'pages/agenda/sessions/[session_id]'

interface DesinscriptionBeneficiaireModalProps {
  onConfirmation: (beneficiaireDesinscrit: {
    id: string
    value: string
    statut: string
    commentaire?: string
  }) => void
  onCancel: () => void
  beneficiaireADesinscrire: BaseBeneficiaireASelectionner
  sessionName: string
}

export default function DesinscriptionBeneficiaireModal({
  onConfirmation,
  onCancel,
  beneficiaireADesinscrire,
  sessionName,
}: DesinscriptionBeneficiaireModalProps) {
  const modalRef = useRef<{
    closeModal: (e: KeyboardEvent | MouseEvent) => void
  }>(null)

  const [typeRefus, setTypeRefus] =
    useState<ValueWithError<string | undefined>>()

  const [commentaire, setCommentaire] =
    useState<ValueWithError<string | undefined>>()

  function validateCommentaire() {
    if (commentaire?.value && commentaire.value.length > 250) {
      setCommentaire({
        value: commentaire.value,
        error:
          'Vous avez dépassé le nombre maximal de caractères. Retirez des caractères.',
      })
    }
  }

  function validateFormulaire(e: FormEvent) {
    e.preventDefault()
    if (!typeRefus?.value) {
      setTypeRefus({
        value: undefined,
        error: 'Veuillez sélectionner un type de refus',
      })
      return
    }

    if (!commentaire?.value > 250 || commentaire?.value === undefined) {
      onConfirmation({
        id: beneficiaireADesinscrire.id,
        value: beneficiaireADesinscrire.value,
        statut: typeRefus.value,
        commentaire:
          typeRefus.value === StatutBeneficiaire.REFUS_JEUNE
            ? commentaire?.value
            : undefined,
      })
    }
  }
  return (
    <Modal
      title={`Vous souhaitez désinscrire ${beneficiaireADesinscrire.value} de ${sessionName}`}
      onClose={onCancel}
      ref={modalRef}
    >
      <form onSubmit={validateFormulaire}>
        <div className='mt-14 flex flex-col justify-center'>
          <div className='flex flex-col gap-2 mb-4'>
            {typeRefus?.error && (
              <InputError id={'select-beneficiaires--error'} className='my-2'>
                {typeRefus.error}
              </InputError>
            )}

            <RadioBox
              isSelected={typeRefus?.value === StatutBeneficiaire.DESINSCRIT}
              onChange={() =>
                setTypeRefus({ value: StatutBeneficiaire.DESINSCRIT })
              }
              label='J’ai fait une erreur lors de l’ajout de ce bénéficiaire'
              name='type-refus'
              id='type-refus--erreur'
            />
            <RadioBox
              isSelected={typeRefus?.value === StatutBeneficiaire.REFUS_TIERS}
              onChange={() =>
                setTypeRefus({ value: StatutBeneficiaire.REFUS_TIERS })
              }
              label='Refus tiers (la désinscription est à mon initiative ou à celle d’un tiers)'
              name='type-refus'
              id='type-refus--tiers'
            />
            <RadioBox
              isSelected={typeRefus?.value === StatutBeneficiaire.REFUS_JEUNE}
              onChange={() =>
                setTypeRefus({ value: StatutBeneficiaire.REFUS_JEUNE })
              }
              label='Refus jeune (la désinscription est à l’initiative du bénéficiaire)'
              name='type-refus'
              id='type-refus--jeune'
            />
          </div>

          <Label htmlFor='refus-commentaire'>
            {{
              main: 'Veuillez préciser le motif de désinscription du bénéficiaire',
              helpText: '250 caractères maximum',
            }}
          </Label>
          <Textarea
            id='refus-commentaire'
            maxLength={250}
            onChange={(value: string) => setCommentaire({ value: value })}
            onBlur={validateCommentaire}
            disabled={typeRefus?.value !== StatutBeneficiaire.REFUS_JEUNE}
          />

          <div className='flex justify-center'>
            <Button
              type='button'
              style={ButtonStyle.SECONDARY}
              onClick={(e) => modalRef.current!.closeModal(e)}
              className='mr-3'
            >
              Annuler
            </Button>
            <Button type='submit'>Confirmer</Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

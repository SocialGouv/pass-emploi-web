import React, { FormEvent, useRef, useState } from 'react'

import { BaseBeneficiaireASelectionner } from 'app/(connected)/(with-sidebar)/(without-chat)/agenda/sessions/[idSession]/DetailsSessionPage'
import RadioBox from 'components/action/RadioBox'
import Modal, { ModalHandles } from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import InputError from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import Textarea from 'components/ui/Form/Textarea'
import { ValueWithError } from 'components/ValueWithError'
import { StatutBeneficiaire } from 'interfaces/session'

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
  const MAX_INPUT_LENGTH = 250

  const modalRef = useRef<ModalHandles>(null)
  const textCommentaire = useRef<HTMLTextAreaElement>(null)

  const [typeRefus, setTypeRefus] = useState<
    ValueWithError<string | undefined>
  >({ value: undefined })

  const [commentaire, setCommentaire] = useState<
    ValueWithError<string | undefined>
  >({ value: undefined })

  function validateCommentaire() {
    if (commentaire.value && commentaire.value.length > MAX_INPUT_LENGTH) {
      setCommentaire({
        value: commentaire.value,
        error:
          'Vous avez dépassé le nombre maximal de caractères. Retirez des caractères.',
      })
    }
  }

  function validateFormulaire(e: FormEvent) {
    e.preventDefault()
    if (!typeRefus.value) {
      setTypeRefus({
        value: undefined,
        error: 'Veuillez sélectionner un type de refus',
      })
      return
    }

    const formulaireEstValide =
      typeRefus.value !== StatutBeneficiaire.REFUS_JEUNE ||
      commentaire.value === undefined ||
      commentaire.value.length <= MAX_INPUT_LENGTH

    if (formulaireEstValide) {
      const beneficiaireDesinscrit = {
        id: beneficiaireADesinscrire.id,
        value: beneficiaireADesinscrire.value,
        statut: typeRefus.value,
      }
      if (
        typeRefus.value === StatutBeneficiaire.REFUS_JEUNE &&
        commentaire.value
      ) {
        onConfirmation({
          ...beneficiaireDesinscrit,
          commentaire: commentaire.value,
        })
      } else {
        onConfirmation(beneficiaireDesinscrit)
      }
    }
  }
  return (
    <Modal
      title={`Vous souhaitez désinscrire ${beneficiaireADesinscrire.value} de ${sessionName}`}
      onClose={onCancel}
      ref={modalRef}
    >
      <form onSubmit={validateFormulaire}>
        <div className='mt-10 flex flex-col justify-center'>
          <fieldset>
            <legend className='sr-only'>Motif de désinscription</legend>

            <div className='flex flex-col gap-2 mb-4'>
              {typeRefus.error && (
                <InputError id={'select-beneficiaires--error'} className='my-2'>
                  {typeRefus.error}
                </InputError>
              )}

              <RadioBox
                id='type-refus-erreur'
                isSelected={typeRefus.value === StatutBeneficiaire.DESINSCRIT}
                onChange={() => {
                  setTypeRefus({ value: StatutBeneficiaire.DESINSCRIT })
                  textCommentaire.current!.value = ''
                }}
                label='J’ai fait une erreur lors de l’ajout de ce bénéficiaire'
                name='type-refus'
              />
              <RadioBox
                id='type-refus-tiers'
                isSelected={typeRefus.value === StatutBeneficiaire.REFUS_TIERS}
                onChange={() => {
                  setTypeRefus({ value: StatutBeneficiaire.REFUS_TIERS })
                  textCommentaire.current!.value = ''
                }}
                label='Refus tiers (la désinscription est à mon initiative ou à celle d’un tiers)'
                name='type-refus'
              />
              <RadioBox
                id='type-refus-beneficiaire'
                isSelected={typeRefus.value === StatutBeneficiaire.REFUS_JEUNE}
                onChange={() =>
                  setTypeRefus({ value: StatutBeneficiaire.REFUS_JEUNE })
                }
                label='Refus jeune (la désinscription est à l’initiative du bénéficiaire)'
                name='type-refus'
              />
            </div>

            <Label htmlFor='refus-commentaire'>
              {{
                main: 'Veuillez préciser le motif de désinscription du bénéficiaire',
                helpText: `${MAX_INPUT_LENGTH} caractères maximum`,
              }}
            </Label>
            <Textarea
              id='refus-commentaire'
              maxLength={MAX_INPUT_LENGTH}
              onChange={(value: string) => setCommentaire({ value: value })}
              onBlur={validateCommentaire}
              disabled={typeRefus.value !== StatutBeneficiaire.REFUS_JEUNE}
              ref={textCommentaire}
            />
          </fieldset>

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

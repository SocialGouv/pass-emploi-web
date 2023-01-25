import React, { FormEvent, useState } from 'react'

import Modal from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import Select from 'components/ui/Form/Select'
import Textarea from 'components/ui/Form/Textarea'
import { IconName } from 'components/ui/IconComponent'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { ValueWithError } from 'components/ValueWithError'
import { BaseJeune } from 'interfaces/jeune'
import { SuppressionJeuneFormData } from 'interfaces/json/jeune'
import { MotifSuppressionJeune } from 'interfaces/referentiel'
import useMatomo from 'utils/analytics/useMatomo'

interface DeleteJeuneActifModalProps {
  jeune: BaseJeune
  motifsSuppression: MotifSuppressionJeune[]
  onClose: () => void
  soumettreSuppression: (payload: SuppressionJeuneFormData) => Promise<void>
}

export default function DeleteJeuneActifModal({
  jeune,
  motifsSuppression,
  onClose,
  soumettreSuppression,
}: DeleteJeuneActifModalProps) {
  const [showModalEtape1, setShowModalEtape1] = useState<boolean>(true)
  const [showModalEtape2, setShowModalEtape2] = useState<boolean>(false)

  const MOTIF_SUPPRESSION_AUTRE = 'Autre'
  const [motifSuppressionJeune, setMotifSuppressionJeune] = useState<
    string | undefined
  >(undefined)
  const [commentaireMotif, setCommentaireMotif] = useState<ValueWithError>({
    value: '',
  })

  const [trackingLabel, setTrackingLabel] = useState<string>(
    'Détail Jeune - Pop-in confirmation suppression'
  )

  function openModalEtape2() {
    setShowModalEtape1(false)
    setShowModalEtape2(true)
    setTrackingLabel('Détail Jeune - Pop-in sélection motif')
  }

  function selectMotifSuppression(value: string) {
    setMotifSuppressionJeune(value)
  }

  function validateCommentaireMotif() {
    if (!commentaireMotif.value) {
      setCommentaireMotif({
        value: commentaireMotif.value,
        error:
          "Le champ Autre n'est pas renseigné. Veuillez préciser le motif de suppression.",
      })
    }
  }

  function motifIsValid(): boolean {
    if (!motifSuppressionJeune) return false
    if (motifSuppressionJeune === MOTIF_SUPPRESSION_AUTRE)
      return Boolean(commentaireMotif.value)
    return true
  }

  async function handleSoumettreSuppression(e: FormEvent) {
    e.preventDefault()
    if (!motifIsValid()) return

    const payload: SuppressionJeuneFormData = {
      motif: motifSuppressionJeune!,
      commentaire:
        motifSuppressionJeune === MOTIF_SUPPRESSION_AUTRE
          ? commentaireMotif.value
          : undefined,
    }

    await soumettreSuppression(payload)
  }

  const descriptionMotif = motifsSuppression.find(
    ({ motif }) => motif === motifSuppressionJeune
  )?.description

  useMatomo(trackingLabel)

  return (
    <>
      {showModalEtape1 && (
        <Modal
          title={`Suppression du compte bénéficiaire ${jeune.prenom} ${jeune.nom}`}
          titleIcon={IconName.Warning}
          onClose={onClose}
        >
          <p className='mb-12 text-base-regular text-content_color text-center'>
            Le bénéficiaire sera prévenu de la suppression de son compte et de
            la possibilité de demander un accès à ses données pendant une
            période de 2 ans avant que celles-ci ne soient supprimées.
          </p>
          <p className='mb-12 text-base-regular text-content_color text-center'>
            Souhaitez-vous continuer la suppression ?
          </p>
          <div className='flex justify-center'>
            <Button
              type='button'
              style={ButtonStyle.SECONDARY}
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              type='button'
              style={ButtonStyle.PRIMARY}
              onClick={openModalEtape2}
              className='ml-6'
            >
              Continuer
            </Button>
          </div>
        </Modal>
      )}

      {showModalEtape2 && (
        <Modal
          title={`Suppression du compte bénéficiaire ${jeune.prenom} ${jeune.nom}`}
          titleIcon={IconName.Warning}
          onClose={onClose}
        >
          <InformationMessage label='Une fois confirmé toutes les informations liées à ce compte jeune seront supprimées' />

          <form className='mt-8' onSubmit={handleSoumettreSuppression}>
            <fieldset>
              <legend className='sr-only'>
                Choisir un motif de suppression
              </legend>
              <Label htmlFor='motif-suppression' inputRequired={true}>
                {{
                  main: 'Motif de suppression',
                  helpText:
                    'Pour nos statistiques, merci de sélectionner un motif',
                }}
              </Label>
              <Select
                id='motif-suppression'
                required
                onChange={selectMotifSuppression}
              >
                {motifsSuppression.map(({ motif }) => (
                  <option key={motif} value={motif}>
                    {motif}
                  </option>
                ))}
              </Select>

              {motifSuppressionJeune !== MOTIF_SUPPRESSION_AUTRE &&
                descriptionMotif && (
                  <p className='mb-8 text-s-regular'>{descriptionMotif}</p>
                )}

              {motifSuppressionJeune === MOTIF_SUPPRESSION_AUTRE && (
                <>
                  <Label htmlFor='commentaire-motif' inputRequired={true}>
                    Veuillez préciser le motif de la suppression du compte
                  </Label>
                  {commentaireMotif.error && (
                    <InputError id='commentaire-motif--error' className='mb-2'>
                      {commentaireMotif.error}
                    </InputError>
                  )}
                  <Textarea
                    id='commentaire-motif'
                    required
                    onChange={(value) => setCommentaireMotif({ value })}
                    onBlur={validateCommentaireMotif}
                    rows={3}
                    invalid={Boolean(commentaireMotif)}
                  />
                </>
              )}
            </fieldset>
            <div className='flex justify-center'>
              <Button
                type='button'
                style={ButtonStyle.SECONDARY}
                onClick={onClose}
              >
                Annuler
              </Button>
              <Button
                type='submit'
                disabled={!motifIsValid()}
                style={ButtonStyle.PRIMARY}
                className='ml-6'
              >
                Confirmer
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}

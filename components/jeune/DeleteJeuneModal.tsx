import { ChangeEvent, FormEvent, useState } from 'react'

import { RequiredValue } from '../RequiredValue'
import { InputError } from '../ui/InputError'

import InformationMessage from 'components/InformationMessage'
import Modal from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button'
import { IconName } from 'components/ui/IconComponent'
import {
  DetailJeune,
  MotifsSuppression,
  TypesMotifsSuppression,
} from 'interfaces/jeune'
import { SuppressionJeuneFormData } from 'interfaces/json/jeune'
import useMatomo from 'utils/analytics/useMatomo'

interface DeleteJeuneModalProps {
  jeune: DetailJeune
  motifsSuppression: MotifsSuppression[]
  onClose: () => void
  soumettreSuppression: (payload: SuppressionJeuneFormData) => Promise<void>
}

export default function DeleteJeuneModal({
  jeune,
  motifsSuppression,
  onClose,
  soumettreSuppression,
}: DeleteJeuneModalProps) {
  const [showModalEtape1, setShowModalEtape1] = useState<boolean>(true)
  const [showModalEtape2, setShowModalEtape2] = useState<boolean>(false)

  const [motifSuppressionJeune, setMotifSuppressionJeune] = useState<string>('')
  const [commentaireMotif, setCommentaireMotif] = useState<RequiredValue>({
    value: '',
  })
  const [showCommentaireMotif, setShowCommentaireMotif] =
    useState<boolean>(false)

  const [trackingLabel, setTrackingLabel] = useState<string>(
    'Détail Jeune - Pop-in confirmation suppression'
  )

  function handleCloseModal() {
    onClose()
  }

  function openModalEtape2() {
    setShowModalEtape1(false)
    setShowModalEtape2(true)
    setTrackingLabel('Détail Jeune - Pop-in sélection motif')
  }

  function handleSelectedMotifSuppressionJeune(
    e: ChangeEvent<HTMLSelectElement>
  ) {
    setMotifSuppressionJeune(e.target.value)
    setShowCommentaireMotif(e.target.value === TypesMotifsSuppression.AUTRE)
  }

  function validateMotifSuppressionAutre() {
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
    if (motifSuppressionJeune === TypesMotifsSuppression.AUTRE)
      return Boolean(commentaireMotif.value)
    return true
  }

  async function handleSoumettreSuppression(e: FormEvent) {
    e.preventDefault()
    const payload: SuppressionJeuneFormData = {
      motif: motifSuppressionJeune,
      commentaire:
        motifSuppressionJeune === TypesMotifsSuppression.AUTRE
          ? commentaireMotif.value
          : undefined,
    }
    if (!motifIsValid()) return Promise.resolve()

    await soumettreSuppression(payload)
  }

  useMatomo(trackingLabel)

  return (
    <>
      {showModalEtape1 && (
        <Modal
          title={`Suppression du compte bénéficiaire ${jeune.prenom} ${jeune.nom}`}
          iconHead
          iconName={IconName.Warning}
          onClose={handleCloseModal}
        >
          <p className='mb-12 text-base-regular text-content_color text-center'>
            Le bénéficiaire sera prévenu de la suppression de son compte et sa
            possibilité de demander un accès à ses données pour une période de 2
            ans avant qu’elles soient supprimées.
          </p>
          <p className='mb-12 text-base-regular text-content_color text-center'>
            Souhaitez-vous continuer la suppression ?
          </p>
          <div className='flex justify-center'>
            <Button
              type='button'
              style={ButtonStyle.SECONDARY}
              onClick={handleCloseModal}
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
          iconHead
          iconName={IconName.Warning}
          onClose={handleCloseModal}
        >
          <InformationMessage content='Une fois confirmé toutes les informations liées à ce compte jeune seront supprimées' />

          <form className='mt-8' onSubmit={handleSoumettreSuppression}>
            <fieldset>
              <legend className='sr-only'>
                Choisir un motif de suppression
              </legend>
              <label
                htmlFor='motifSuppression'
                className='text-base-medium mb-2'
              >
                <span aria-hidden={true}>* </span>Motif de suppression
                <span className='text-s-regular block mb-3'>
                  {' '}
                  Veuillez sélectionner un motif de suppression de compte
                </span>
              </label>
              <select
                id='motifSuppression'
                name='motifSuppression'
                defaultValue={motifSuppressionJeune}
                required
                onChange={handleSelectedMotifSuppressionJeune}
                className={`border border-solid border-content_color rounded-medium w-full px-4 py-3 mb-8 disabled:bg-grey_100`}
              >
                <option hidden value={''} />
                {motifsSuppression?.map((motif) => (
                  <option key={motif.toString()} value={motif}>
                    {motif}
                  </option>
                ))}
              </select>

              {showCommentaireMotif && (
                <>
                  <label
                    htmlFor='motifSuppression-autre'
                    className='text-base-medium'
                  >
                    <span aria-hidden={true}>* </span>
                    Veuillez préciser le motif de la suppression du compte
                  </label>
                  {commentaireMotif.error && (
                    <InputError
                      id='motifSuppression-autre--error'
                      className='mb-2'
                    >
                      {commentaireMotif.error}
                    </InputError>
                  )}
                  <textarea
                    id='motifSuppression-autre'
                    name='motifSuppression-autre'
                    required
                    defaultValue={commentaireMotif.value}
                    onChange={(e) =>
                      setCommentaireMotif({ value: e.target.value })
                    }
                    onBlur={validateMotifSuppressionAutre}
                    rows={3}
                    aria-invalid={commentaireMotif.error ? true : undefined}
                    aria-describedby={
                      commentaireMotif.error
                        ? 'motifSuppression-autre--error'
                        : undefined
                    }
                    className={`border border-solid border-content_color rounded-medium w-full px-4 py-3 mb-8 mt-3 ${
                      commentaireMotif.error
                        ? 'border-warning text-warning'
                        : 'border-content_color'
                    }`}
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

import { ChangeEvent, FormEvent, useState } from 'react'

import InformationMessage from 'components/InformationMessage'
import Modal from 'components/Modal'
import { RequiredValue } from 'components/RequiredValue'
import Button, { ButtonStyle } from 'components/ui/Button'
import { IconName } from 'components/ui/IconComponent'
import { InputError } from 'components/ui/InputError'
import { BaseJeune } from 'interfaces/jeune'
import { SuppressionJeuneFormData } from 'interfaces/json/jeune'
import useMatomo from 'utils/analytics/useMatomo'

interface DeleteJeuneActifModalProps {
  jeune: BaseJeune
  motifsSuppression: string[]
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
  const [commentaireMotif, setCommentaireMotif] = useState<RequiredValue>({
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

  function selectMotifSuppression(e: ChangeEvent<HTMLSelectElement>) {
    setMotifSuppressionJeune(e.target.value)
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
          <InformationMessage content='Une fois confirmé toutes les informations liées à ce compte jeune seront supprimées' />

          <form className='mt-8' onSubmit={handleSoumettreSuppression}>
            <fieldset>
              <legend className='sr-only'>
                Choisir un motif de suppression
              </legend>
              <label
                htmlFor='motif-suppression'
                className='text-base-medium mb-2'
              >
                <span aria-hidden={true}>* </span>Motif de suppression
                <span className='text-s-regular block mb-3'>
                  {' '}
                  Veuillez sélectionner un motif de suppression de compte
                </span>
              </label>
              <select
                id='motif-suppression'
                name='motif-suppression'
                required
                onChange={selectMotifSuppression}
                className={`border border-solid border-content_color rounded-medium w-full px-4 py-3 mb-8 disabled:bg-grey_100`}
              >
                <option hidden value={''} />
                {motifsSuppression.map((motif) => (
                  <option key={motif} value={motif}>
                    {motif}
                  </option>
                ))}
              </select>

              {motifSuppressionJeune === MOTIF_SUPPRESSION_AUTRE && (
                <>
                  <label
                    htmlFor='commentaire-motif'
                    className='text-base-medium'
                  >
                    <span aria-hidden={true}>* </span>
                    Veuillez préciser le motif de la suppression du compte
                  </label>
                  {commentaireMotif.error && (
                    <InputError id='commentaire-motif--error' className='mb-2'>
                      {commentaireMotif.error}
                    </InputError>
                  )}
                  <textarea
                    id='commentaire-motif'
                    name='commentaire-motif'
                    required
                    onChange={(e) =>
                      setCommentaireMotif({ value: e.target.value })
                    }
                    onBlur={validateCommentaireMotif}
                    rows={3}
                    aria-invalid={commentaireMotif.error ? true : undefined}
                    aria-describedby={
                      commentaireMotif.error
                        ? 'commentaire-motif--error'
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

import React, {
  FormEvent,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from 'react'

import Modal, { ModalHandles } from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import Select from 'components/ui/Form/Select'
import Textarea from 'components/ui/Form/Textarea'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { ValueWithError } from 'components/ValueWithError'
import { BaseBeneficiaire } from 'interfaces/beneficiaire'
import { SuppressionBeneficiaireFormData } from 'interfaces/json/beneficiaire'
import { MotifSuppressionBeneficiaire } from 'interfaces/referentiel'
import useMatomo from 'utils/analytics/useMatomo'
import { usePortefeuille } from 'utils/portefeuilleContext'

interface DeleteJeuneActifModalProps {
  jeune: BaseBeneficiaire
  motifsSuppression: MotifSuppressionBeneficiaire[]
  onClose: () => void
  soumettreSuppression: (
    payload: SuppressionBeneficiaireFormData
  ) => Promise<void>
}

export default function DeleteJeuneActifModal({
  jeune,
  motifsSuppression,
  onClose,
  soumettreSuppression,
}: DeleteJeuneActifModalProps) {
  const [portefeuille] = usePortefeuille()

  const modalRef = useRef<ModalHandles>(null)

  const [showModalEtape1, setShowModalEtape1] = useState<boolean>(true)
  const [showModalEtape2, setShowModalEtape2] = useState<boolean>(false)
  const [suppressionEnCours, setSuppressionEnCours] = useState<boolean>(false)

  const MOTIF_SUPPRESSION_AUTRE = 'Autre'
  const [motifSuppressionJeune, setMotifSuppressionJeune] = useState<
    ValueWithError<string | undefined>
  >({ value: undefined })
  const [commentaireMotif, setCommentaireMotif] = useState<ValueWithError>({
    value: '',
  })

  const [trackingLabel, setTrackingLabel] = useState<string>(
    'Détail Jeune - Pop-in confirmation suppression'
  )
  function openModalEtape2(e: MouseEvent<HTMLButtonElement>) {
    modalRef.current!.closeModal(e)
    setShowModalEtape2(true)
    setTrackingLabel('Détail Jeune - Pop-in sélection motif')
  }

  function selectMotifSuppression(value: string) {
    setMotifSuppressionJeune({ value })
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
    if (!motifSuppressionJeune?.value) {
      setMotifSuppressionJeune({
        ...motifSuppressionJeune,
        error: 'Le champ ”Motif” est vide. Renseignez un motif de suppression.',
      })
      return false
    }

    if (
      motifSuppressionJeune?.value === MOTIF_SUPPRESSION_AUTRE &&
      !commentaireMotif.value
    ) {
      setCommentaireMotif({
        ...commentaireMotif,
        error:
          'Le champ ”Motif de suppression” est vide. Renseignez un commentaire.',
      })
      return false
    }

    return true
  }

  async function handleSoumettreSuppression(e: FormEvent) {
    e.preventDefault()
    if (!motifIsValid()) return

    const payload: SuppressionBeneficiaireFormData = {
      motif: motifSuppressionJeune.value!,
      commentaire:
        motifSuppressionJeune.value === MOTIF_SUPPRESSION_AUTRE
          ? commentaireMotif.value
          : undefined,
    }

    setSuppressionEnCours(true)
    try {
      await soumettreSuppression(payload)
    } finally {
      setSuppressionEnCours(false)
    }
  }

  const descriptionMotif = motifsSuppression.find(
    ({ motif }) => motif === motifSuppressionJeune?.value
  )?.description

  useEffect(() => {
    if (!showModalEtape1 && !showModalEtape2) onClose()
  }, [showModalEtape1, showModalEtape2])

  useMatomo(trackingLabel, portefeuille.length > 0)

  return (
    <>
      {showModalEtape1 && (
        <Modal
          ref={modalRef}
          title={`Souhaitez-vous supprimer le compte bénéficiaire : ${jeune.prenom} ${jeune.nom} ?`}
          onClose={() => setShowModalEtape1(false)}
          titleIllustration={IllustrationName.Delete}
        >
          <p className='mt-6 text-base-regular text-content_color text-center'>
            Le bénéficiaire sera notifié de la suppression de son compte. Les
            données seront conservées pendant 2 ans avant leur suppression.
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
              onClick={(e) => openModalEtape2(e)}
              className='ml-6'
            >
              Supprimer ce compte
            </Button>
          </div>
        </Modal>
      )}

      {showModalEtape2 && (
        <Modal
          ref={modalRef}
          title={`Souhaitez-vous supprimer le compte bénéficiaire : ${jeune.prenom} ${jeune.nom} ?`}
          onClose={() => setShowModalEtape2(false)}
          titleIllustration={IllustrationName.Delete}
        >
          <InformationMessage label='Une fois confirmé toutes les informations liées à ce compte bénéficiaire seront supprimées' />

          <form
            className='mt-8'
            onSubmit={handleSoumettreSuppression}
            noValidate={true}
          >
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

              {motifSuppressionJeune?.error && (
                <InputError id='motif-suppression--error' className='mt-2'>
                  {motifSuppressionJeune.error}
                </InputError>
              )}

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

              {motifSuppressionJeune?.value !== MOTIF_SUPPRESSION_AUTRE &&
                descriptionMotif && (
                  <p className='mb-8 text-s-regular'>{descriptionMotif}</p>
                )}

              {motifSuppressionJeune?.value === MOTIF_SUPPRESSION_AUTRE && (
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
                    invalid={Boolean(commentaireMotif.error)}
                  />
                </>
              )}
            </fieldset>
            <div className='flex justify-center'>
              <Button
                type='button'
                style={ButtonStyle.SECONDARY}
                onClick={(e) => modalRef.current!.closeModal(e)}
              >
                Annuler
              </Button>
              <Button
                type='submit'
                style={ButtonStyle.PRIMARY}
                className='ml-6'
                isLoading={suppressionEnCours}
              >
                Supprimer le compte
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}

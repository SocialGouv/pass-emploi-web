import { DateTime } from 'luxon'
import React, {
  FormEvent,
  ForwardedRef,
  forwardRef,
  MouseEvent,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import Modal, { ModalHandles } from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import Input from 'components/ui/Form/Input'
import InputError from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import Select from 'components/ui/Form/Select'
import Textarea from 'components/ui/Form/Textarea'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { ValueWithError } from 'components/ValueWithError'
import {
  BaseBeneficiaire,
  BeneficiaireWithActivity,
} from 'interfaces/beneficiaire'
import { SuppressionBeneficiaireFormData } from 'interfaces/json/beneficiaire'
import { MotifSuppressionBeneficiaire } from 'interfaces/referentiel'
import useMatomo from 'utils/analytics/useMatomo'
import { dateIsInInterval, toShortDate } from 'utils/date'
import { usePortefeuille } from 'utils/portefeuilleContext'

interface DeleteBeneficiaireActifModalProps {
  beneficiaire: BeneficiaireWithActivity
  motifsSuppression: MotifSuppressionBeneficiaire[]
  onClose: () => void
  soumettreSuppression: (
    payload: SuppressionBeneficiaireFormData
  ) => Promise<void>
}

function DeleteBeneficiaireActifModal(
  {
    beneficiaire,
    motifsSuppression,
    onClose,
    soumettreSuppression,
  }: DeleteBeneficiaireActifModalProps,
  ref: ForwardedRef<ModalHandles>
) {
  const [portefeuille] = usePortefeuille()

  const modalRef = useRef<ModalHandles>(null)
  useImperativeHandle(ref, () => modalRef.current!)

  const [showModalConfirmation, setShowModalConfirmation] =
    useState<boolean>(true)
  const [showModalSuppressionForm, setShowModalSuppressionForm] =
    useState<boolean>(false)

  const [trackingLabel, setTrackingLabel] = useState<string>(
    'Détail Jeune - Pop-in confirmation suppression'
  )

  function openModalSuppressionForm(e: MouseEvent<HTMLButtonElement>) {
    modalRef.current!.closeModal(e)
    setShowModalSuppressionForm(true)
    setTrackingLabel('Détail Jeune - Pop-in sélection motif')
  }

  useEffect(() => {
    if (!showModalConfirmation && !showModalSuppressionForm) onClose()
  }, [showModalConfirmation, showModalSuppressionForm])

  useMatomo(trackingLabel, portefeuille.length > 0)

  return (
    <>
      {showModalConfirmation && (
        <ModalConfirmation
          ref={modalRef}
          beneficiaire={beneficiaire}
          onClose={() => setShowModalConfirmation(false)}
          onNext={openModalSuppressionForm}
        />
      )}

      {showModalSuppressionForm && (
        <ModalSuppressionForm
          ref={modalRef}
          beneficiaire={beneficiaire}
          motifsSuppression={motifsSuppression}
          onSuppression={soumettreSuppression}
          onClose={() => setShowModalSuppressionForm(false)}
        />
      )}
    </>
  )
}
export default forwardRef(DeleteBeneficiaireActifModal)

const ModalConfirmation = forwardRef(
  (
    {
      beneficiaire,
      onNext,
      onClose,
    }: {
      beneficiaire: BaseBeneficiaire
      onNext: (e: MouseEvent<HTMLButtonElement>) => void
      onClose: () => void
    },
    ref: ForwardedRef<ModalHandles>
  ) => {
    const modalRef = useRef<ModalHandles>(null)
    useImperativeHandle(ref, () => modalRef.current!)

    return (
      <Modal
        ref={modalRef}
        title={`Souhaitez-vous supprimer le compte bénéficiaire : ${beneficiaire.prenom} ${beneficiaire.nom} ?`}
        onClose={onClose}
        titleIllustration={IllustrationName.Delete}
      >
        <InformationMessageArchivage />

        <p className='text-center py-8'>
          Le bénéficiaire sera notifié de la suppression de son compte.
        </p>

        <div className='flex justify-center'>
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
            onClick={onNext}
            className='ml-6'
          >
            Supprimer ce compte
          </Button>
        </div>
      </Modal>
    )
  }
)
ModalConfirmation.displayName = 'ModalConfirmation'

const ModalSuppressionForm = forwardRef(
  (
    {
      beneficiaire,
      motifsSuppression,
      onSuppression,
      onClose,
    }: {
      beneficiaire: BeneficiaireWithActivity
      motifsSuppression: MotifSuppressionBeneficiaire[]
      onSuppression: (payload: SuppressionBeneficiaireFormData) => Promise<void>
      onClose: () => void
    },
    ref: ForwardedRef<ModalHandles>
  ) => {
    const modalRef = useRef<ModalHandles>(null)
    useImperativeHandle(ref, () => modalRef.current!)

    const [suppressionEnCours, setSuppressionEnCours] = useState<boolean>(false)

    const MOTIF_SUPPRESSION_AUTRE = 'Autre'
    const [motifSuppression, setMotifSuppression] = useState<
      ValueWithError<string | undefined>
    >({ value: undefined })
    const [commentaireMotif, setCommentaireMotif] = useState<
      ValueWithError<string | undefined>
    >({
      value: undefined,
    })
    const descriptionMotif = motifsSuppression.find(
      ({ motif }) => motif === motifSuppression?.value
    )?.description

    const dateCreationBeneficiaire = DateTime.fromISO(beneficiaire.creationDate)
    const [dateFinAccompagnement, setDateFinAccompagnement] = useState<
      ValueWithError<string | undefined>
    >({ value: undefined })

    function selectMotifSuppression(value: string) {
      setMotifSuppression({ value })
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
      if (!motifSuppression?.value) {
        setMotifSuppression({
          ...motifSuppression,
          error:
            'Le champ ”Motif” est vide. Renseignez un motif de suppression.',
        })
        return false
      }

      if (
        motifSuppression?.value === MOTIF_SUPPRESSION_AUTRE &&
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

    function validateDateFinAccompagnement(): boolean {
      if (!dateFinAccompagnement.value) {
        setDateFinAccompagnement({
          ...dateFinAccompagnement,
          error:
            'Le champ “Date de fin d’accompagnement” est vide. Renseignez une date de fin d’accompagnement.',
        })
        return false
      } else if (
        !dateIsInInterval(
          DateTime.fromISO(dateFinAccompagnement.value),
          dateCreationBeneficiaire,
          DateTime.now()
        )
      ) {
        setDateFinAccompagnement({
          ...dateFinAccompagnement,
          error: `Le champ “Date de fin d’accompagnement” est invalide. Le date attendue est comprise entre la date de création du bénéficiaire et maintenant.`,
        })
        return false
      }

      return true
    }

    async function handleSoumettreSuppression(e: FormEvent) {
      e.preventDefault()
      if (!motifIsValid() || !validateDateFinAccompagnement()) return

      const payload: SuppressionBeneficiaireFormData = {
        motif: motifSuppression.value!,
        commentaire:
          motifSuppression.value === MOTIF_SUPPRESSION_AUTRE
            ? commentaireMotif.value
            : undefined,
        dateFinAccompagnement: dateFinAccompagnement.value!,
      }

      setSuppressionEnCours(true)
      try {
        await onSuppression(payload)
      } finally {
        setSuppressionEnCours(false)
      }
    }

    return (
      <Modal
        ref={modalRef}
        title={`Souhaitez-vous supprimer le compte bénéficiaire : ${beneficiaire.prenom} ${beneficiaire.nom} ?`}
        onClose={onClose}
        titleIllustration={IllustrationName.Delete}
      >
        <InformationMessageArchivage />

        <form
          className='mt-8'
          onSubmit={handleSoumettreSuppression}
          noValidate={true}
        >
          <fieldset>
            <legend className='pb-8 m-auto'>
              Le bénéficiaire sera notifié de la suppression de son compte.
            </legend>

            <Label htmlFor='motif-suppression' inputRequired={true}>
              Motif de suppression
            </Label>

            {motifSuppression?.error && (
              <InputError id='motif-suppression--error' className='mt-2'>
                {motifSuppression.error}
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

            {motifSuppression?.value !== MOTIF_SUPPRESSION_AUTRE &&
              descriptionMotif && (
                <p className='mb-8 text-s-regular'>{descriptionMotif}</p>
              )}

            {motifSuppression?.value === MOTIF_SUPPRESSION_AUTRE && (
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

            <Label htmlFor='date-fin-accompagnement' inputRequired={true}>
              {{
                main: 'Date de fin d’accompagnement',
                helpText: `la dernière activité date du ${toShortDate(beneficiaire.lastActivity!)}`,
              }}
            </Label>

            {dateFinAccompagnement.error && (
              <InputError id='date-fin-accompagnement--error'>
                {dateFinAccompagnement.error}
              </InputError>
            )}

            <Input
              type='date'
              id='date-fin-accompagnement'
              onChange={(value) => setDateFinAccompagnement({ value })}
              onBlur={validateDateFinAccompagnement}
              required={true}
              invalid={Boolean(dateFinAccompagnement.error)}
            />
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
    )
  }
)
ModalSuppressionForm.displayName = 'ModalSuppressionForm'

function InformationMessageArchivage() {
  return (
    <InformationMessage
      label='À la suppression le bénéficiaire n’apparaitra plus dans votre
            portefeuille. Ces données seront archivées en toute sécurité pendant
            2 ans avant d’être automatiquement supprimées.'
    />
  )
}

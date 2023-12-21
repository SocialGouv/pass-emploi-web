'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import React, { FormEvent, MouseEvent, useRef, useState } from 'react'

import RadioBox from 'components/action/RadioBox'
import LeavePageConfirmationModal from 'components/LeavePageConfirmationModal'
import Modal from 'components/Modal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import { Etape } from 'components/ui/Form/Etape'
import Input from 'components/ui/Form/Input'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import Select from 'components/ui/Form/Select'
import Textarea from 'components/ui/Form/Textarea'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'
import RecapitulatifErreursFormulaire, {
  LigneErreur,
} from 'components/ui/Notifications/RecapitulatifErreursFormulaire'
import { ValueWithError } from 'components/ValueWithError'
import {
  ActionPredefinie,
  SituationNonProfessionnelle,
  StatutAction,
} from 'interfaces/action'
import useMatomo from 'utils/analytics/useMatomo'
import {
  dateIsInInterval,
  toFrenchFormat,
  toShortDate,
  WEEKDAY,
} from 'utils/date'
import { useLeavePageModal } from 'utils/hooks/useLeavePageModal'
import { usePortefeuille } from 'utils/portefeuilleContext'

type EditionActionProps = {
  idJeune: string
  categories: SituationNonProfessionnelle[]
  actionsPredefinies: ActionPredefinie[]
  returnTo: string
}

export const TITRE_AUTRE = 'Autre'

function NouvelleActionPage({
  idJeune,
  categories,
  actionsPredefinies,
  returnTo,
}: EditionActionProps) {
  const [portefeuille] = usePortefeuille()

  const [codeCategorie, setCodeCategorie] = useState<
    ValueWithError<string | undefined>
  >({ value: undefined })
  const [titre, setTitre] = useState<ValueWithError<string | undefined>>({
    value: undefined,
  })
  const [titrePersonnalise, setTitrePersonnalise] = useState<
    ValueWithError<string | undefined>
  >({ value: undefined })
  const [description, setDescription] = useState<string | undefined>()
  const [statut, setStatut] = useState<StatutAction>(StatutAction.Terminee)
  const [dateEcheance, setDateEcheance] = useState<
    ValueWithError<string | undefined>
  >({ value: undefined })
  const INPUT_MAX_LENGTH = 250

  const [showHelperCategories, setShowHelperCategories] =
    useState<boolean>(false)
  const modalRef = useRef<{
    closeModal: (e: KeyboardEvent | MouseEvent) => void
  }>(null)
  const [succesCreation, setSuccesCreation] = useState<boolean>(false)

  const [showLeavePageModal, setShowLeavePageModal] = useState<boolean>(false)
  const [confirmBeforeLeaving, setConfirmBeforeLeaving] =
    useState<boolean>(true)

  const initialTracking = 'Actions jeune – Création action'
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)
  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  function formulaireEstValide(): boolean {
    const categorieEstValide = validerCategorie()
    const titreEstValide = validerTitre() && validerTitrePersonnalise()
    const dateEcheanceEstValide = validerDateEcheance()

    return Boolean(
      categorieEstValide && titreEstValide && dateEcheanceEstValide
    )
  }

  function validerCategorie() {
    if (!codeCategorie.value) {
      setCodeCategorie({
        ...codeCategorie,
        error: 'Le champ “Catégorie" est vide. Renseignez une catégorie.',
      })
      return false
    }
    return true
  }

  function validerTitre() {
    if (!titre.value) {
      setTitre({
        ...titre,
        error: 'Le champ “Titre de l’action" est vide. Renseignez un titre.',
      })
      return false
    }
    return true
  }

  function validerTitrePersonnalise() {
    if (titre.value === TITRE_AUTRE && !titrePersonnalise.value) {
      setTitrePersonnalise({
        ...titrePersonnalise,
        error:
          'Le champ "Titre personnalisé" est vide. Renseignez un titre personnalisé.',
      })
      return false
    }
    return true
  }

  function validerDateEcheance() {
    const unAnAvant = DateTime.now().minus({ year: 1, day: 1 })
    const deuxAnsApres = DateTime.now().plus({ year: 2 })

    if (!dateEcheance.value) {
      setDateEcheance({
        ...dateEcheance,
        error: 'Le champ “Date” est vide. Renseignez une date de l’action.',
      })
      return false
    } else if (
      !dateIsInInterval(
        DateTime.fromFormat(dateEcheance.value, 'yyyy-MM-dd'),
        unAnAvant,
        deuxAnsApres
      )
    ) {
      setDateEcheance({
        ...dateEcheance,
        error: `Le champ “Date” est invalide. Le date attendue est comprise entre le ${toShortDate(
          unAnAvant
        )} et le ${toShortDate(deuxAnsApres)}.`,
      })
      return false
    }
    return true
  }

  async function creerAction(e: FormEvent) {
    e.preventDefault()
    if (!formulaireEstValide()) return
    setConfirmBeforeLeaving(false)

    const action = {
      codeCategorie: codeCategorie.value!,
      titre:
        titre.value !== TITRE_AUTRE ? titre.value! : titrePersonnalise.value!,
      dateEcheance: dateEcheance.value!,
      commentaire: description,
      statut,
    }
    const { creerAction: _creerAction } = await import(
      'services/actions.service'
    )
    await _creerAction(action, idJeune)

    setTrackingTitle('Actions jeune – Succès création action')
    setSuccesCreation(true)
  }

  function getErreurs(): LigneErreur[] {
    const erreurs = []

    if (codeCategorie.error) {
      erreurs.push({
        ancre: '#categorie-action',
        label: 'Le champ Catégorie est vide.',
        titreChamp: 'Catégorie',
      })
    }

    if (titre.error) {
      erreurs.push({
        ancre: '#titre-action',
        label: 'Le champ Titre de l’action est vide.',
        titreChamp: 'Titre de l’action',
      })
    }

    if (titrePersonnalise.error) {
      erreurs.push({
        ancre: '#titre-action--personnalise',
        label: 'Le champ Titre personnalisé est vide.',
        titreChamp: 'Titre personnalisé',
      })
    }

    if (dateEcheance.error) {
      const ancre = '#date-echeance-action'
      const label = 'Le champ Date est vide.'
      const titreChamp = 'Date'

      erreurs.push({ ancre, label, titreChamp })
    }

    return erreurs
  }

  function resetForm() {
    setCodeCategorie({ value: undefined })
    setTitre({ value: undefined })
    setTitrePersonnalise({ value: undefined })
    setDescription(undefined)
    setStatut(StatutAction.Terminee)
    setDateEcheance({ value: undefined })
    setSuccesCreation(false)
    setTrackingTitle(initialTracking)
  }

  function permuterAffichageHelperCategories() {
    setShowHelperCategories(!showHelperCategories)
  }

  function openLeavePageConfirmationModal() {
    setShowLeavePageModal(true)
    setConfirmBeforeLeaving(false)
  }

  function closeLeavePageConfirmationModal() {
    setShowLeavePageModal(false)
    setConfirmBeforeLeaving(true)
  }

  useLeavePageModal(confirmBeforeLeaving, openLeavePageConfirmationModal)

  useMatomo(trackingTitle, aDesBeneficiaires)

  return (
    <>
      {!succesCreation && (
        <>
          <RecapitulatifErreursFormulaire erreurs={getErreurs()} />

          <form onSubmit={creerAction} noValidate={true}>
            <p className='text-s-bold text-content_color mb-4'>
              Tous les champs avec * sont obligatoires
            </p>

            <Etape numero={1} titre='Informations principales'>
              <Label htmlFor='categorie-action' inputRequired={true}>
                Catégorie
              </Label>
              {codeCategorie.error && (
                <InputError id='categorie-action--error' className='mb-2'>
                  {codeCategorie.error}
                </InputError>
              )}
              <Select
                id='categorie-action'
                required={true}
                onChange={(value) => setCodeCategorie({ value })}
              >
                {categories.map(({ code, label }) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </Select>
              <button
                type='button'
                onClick={permuterAffichageHelperCategories}
                className='flex items-center gap-2 text-primary mt-[-1.5rem] mb-8'
              >
                À quoi servent les catégories ?
                <IconComponent
                  name={IconName.Help}
                  className='fill-[currentColor] w-4 h-4'
                  aria-hidden={true}
                  focusable={false}
                />
              </button>

              <Label htmlFor='titre-action' inputRequired={true}>
                Titre de l’action
              </Label>
              {titre.error && (
                <InputError id='titre-action--error' className='mb-2'>
                  {titre.error}
                </InputError>
              )}
              <Select
                id='titre-action'
                required={true}
                onChange={(value: string) => setTitre({ value })}
                onBlur={validerTitre}
                invalid={Boolean(titre.error)}
              >
                {actionsPredefinies.map(({ id, titre: titreAction }) => (
                  <option key={id}>{titreAction}</option>
                ))}
              </Select>

              {titre.value === TITRE_AUTRE && (
                <>
                  <Label
                    htmlFor='titre-action--personnalise'
                    inputRequired={true}
                  >
                    Ajoutez un titre personnalisé
                  </Label>
                  {titrePersonnalise.error && (
                    <InputError
                      id='titre-action--personnalise--error'
                      className='mb-2'
                    >
                      {titrePersonnalise.error}
                    </InputError>
                  )}
                  <Input
                    type='text'
                    id='titre-action--personnalise'
                    required={true}
                    onChange={(value) => setTitrePersonnalise({ value })}
                    onBlur={validerTitrePersonnalise}
                    invalid={Boolean(titrePersonnalise.error)}
                  />
                </>
              )}

              <Label htmlFor='commentaire-action'>
                {{
                  main: 'Description',
                  helpText:
                    'Ajoutez des précisions, pour vous ou votre bénéficiaire.',
                }}
              </Label>
              <Textarea
                id='commentaire-action'
                defaultValue={description}
                onChange={setDescription}
                maxLength={INPUT_MAX_LENGTH}
              />
            </Etape>

            <Etape numero={2} titre='Statut et date'>
              <fieldset>
                <legend className='text-base-regular text-content_color mb-3'>
                  <span aria-hidden={true}>*&nbsp;</span>L’action est :
                </legend>
                <div className='mb-7 flex flex-wrap'>
                  <RadioBox
                    isSelected={statut === StatutAction.EnCours}
                    id='statut-action--arealiser'
                    label='À faire'
                    name='statut-action'
                    onChange={() => setStatut(StatutAction.EnCours)}
                  />
                  <RadioBox
                    isSelected={statut === StatutAction.Terminee}
                    id='statut-action--terminee'
                    label='Terminée'
                    name='statut-action'
                    onChange={() => setStatut(StatutAction.Terminee)}
                  />
                </div>
              </fieldset>

              <Label htmlFor='date-action' inputRequired={true}>
                Date
              </Label>
              {dateEcheance.error && (
                <InputError id='date-action--error' className='mb-2'>
                  {dateEcheance.error}
                </InputError>
              )}
              <Input
                type='date'
                id='date-action'
                required={true}
                defaultValue={dateEcheance.value}
                onChange={(value: string) => setDateEcheance({ value })}
                onBlur={validerDateEcheance}
                invalid={Boolean(dateEcheance.error)}
              />
              <div className='gap-2 flex flex-wrap'>
                <BoutonDateRapide
                  date={DateTime.now()}
                  label="Aujourd'hui"
                  onClick={(date) => {
                    setDateEcheance({ value: date })
                  }}
                />
                <BoutonDateRapide
                  date={DateTime.now().plus({ day: 1 })}
                  label='Demain'
                  onClick={(date) => {
                    setDateEcheance({ value: date })
                  }}
                />
                <BoutonDateRapide
                  date={DateTime.now().plus({ week: 1 }).startOf('week')}
                  label='Semaine prochaine'
                  onClick={(date) => {
                    setDateEcheance({ value: date })
                  }}
                />
              </div>
            </Etape>

            <div className='mt-8 flex justify-center'>
              <ButtonLink href={returnTo} style={ButtonStyle.SECONDARY}>
                Annuler
              </ButtonLink>
              <Button type='submit' className='ml-6'>
                <IconComponent
                  name={IconName.Add}
                  focusable={false}
                  aria-hidden={true}
                  className='mr-2 w-4 h-4'
                />
                Créer l’action
              </Button>
            </div>
          </form>
        </>
      )}

      {succesCreation && (
        <div className='text-center'>
          <IllustrationComponent
            name={IllustrationName.Check}
            className='m-auto fill-success_darken w-[180px] h-[180px]'
            aria-hidden={true}
            focusable={false}
          />
          <h2 className='text-m-bold mb-2'>Action enregistrée !</h2>
          <p>
            L’action est en route vers l’application de votre bénéficiaire. De
            votre côté, retrouvez l’action dans la fiche bénéficiaire ou
            l’onglet Pilotage !
          </p>
          <div className='mt-10 flex justify-center gap-4'>
            <Button style={ButtonStyle.SECONDARY} onClick={resetForm}>
              Créer une nouvelle action
            </Button>
            <ButtonLink href={returnTo} style={ButtonStyle.PRIMARY}>
              Consulter la liste des actions
            </ButtonLink>
          </div>
        </div>
      )}

      {showHelperCategories && (
        <Modal
          ref={modalRef}
          title='Pourquoi choisir une catégorie ?'
          titleIllustration={IllustrationName.Info}
          onClose={() => setShowHelperCategories(false)}
        >
          <p>
            Les catégories proposées sont le reflet de celles que vous
            retrouverez lors de la qualification. Elles vous permettent de
            gagner du temps.
          </p>
          <Button
            style={ButtonStyle.PRIMARY}
            onClick={(e) => modalRef.current!.closeModal(e)}
            className='block m-auto mt-4'
          >
            Fermer
          </Button>
        </Modal>
      )}

      {showLeavePageModal && (
        <LeavePageConfirmationModal
          titre={`Souhaitez-vous quitter la création de l’action ?`}
          commentaire='Les informations saisies seront perdues.'
          onCancel={closeLeavePageConfirmationModal}
          destination={returnTo}
        />
      )}
    </>
  )
}

function BoutonDateRapide({
  date,
  label,
  onClick,
}: {
  date: DateTime
  label: string
  onClick: (date: string) => void
}) {
  return (
    <input
      type='button'
      id={label}
      aria-controls='date-action'
      className='text-s-medium border border-solid border-grey_700 rounded-base px-2 py-1 cursor-pointer hover:border-primary hover:bg-primary_lighten'
      value={`${label} (${toFrenchFormat(date, WEEKDAY)})`}
      onClick={() => {
        onClick(date.toISODate())
      }}
    />
  )
}

export default withTransaction(
  NouvelleActionPage.name,
  'page'
)(NouvelleActionPage)

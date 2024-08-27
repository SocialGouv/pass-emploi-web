import { DateTime } from 'luxon'
import React, { FormEvent, MouseEvent, useRef, useState } from 'react'

import RadioBox from 'components/action/RadioBox'
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
import { IllustrationName } from 'components/ui/IllustrationComponent'
import RecapitulatifErreursFormulaire, {
  LigneErreur,
} from 'components/ui/Notifications/RecapitulatifErreursFormulaire'
import { ValueWithError } from 'components/ValueWithError'
import {
  Action,
  ActionPredefinie,
  SituationNonProfessionnelle,
  StatutAction,
} from 'interfaces/action'
import { ActionFormData } from 'interfaces/json/action'
import { dateIsInInterval, toShortDate, toWeekday } from 'utils/date'

interface EditionRdvFormProps {
  actionsPredefinies: ActionPredefinie[]
  categories: SituationNonProfessionnelle[]
  returnTo: string
  soumettreAction: (payload: ActionFormData) => Promise<void>
  action?: Action
}
export function EditionActionForm({
  action,
  actionsPredefinies,
  categories,
  returnTo,
  soumettreAction,
}: EditionRdvFormProps) {
  const TITRE_AUTRE = 'Autre'
  const [codeCategorie, setCodeCategorie] = useState<
    ValueWithError<string | undefined>
  >({ value: action?.qualification?.code })

  function titreEstPersonnalise({ content }: Action) {
    return !actionsPredefinies.some(({ titre }) => titre === content)
  }

  const [titre, setTitre] = useState<ValueWithError<string | undefined>>(
    !action
      ? { value: undefined }
      : titreEstPersonnalise(action)
        ? { value: TITRE_AUTRE }
        : { value: action.content }
  )
  const [titrePersonnalise, setTitrePersonnalise] = useState<
    ValueWithError<string | undefined>
  >(
    action && titreEstPersonnalise(action)
      ? { value: action.content }
      : { value: undefined }
  )
  const [description, setDescription] = useState<string | undefined>(
    action?.comment
  )
  const [statut, setStatut] = useState<StatutAction>(
    action?.status ?? StatutAction.Terminee
  )

  const dateEcheance =
    action && DateTime.fromISO(action.dateEcheance).toISODate()
  const [dateAction, setDateAction] = useState<
    ValueWithError<string | undefined>
  >({ value: dateEcheance })
  const dateFinReelle =
    action?.dateFinReelle && DateTime.fromISO(action.dateFinReelle).toISODate()
  const [dateRealisation, setDateRealisation] = useState<
    ValueWithError<string | undefined>
  >({ value: dateFinReelle })

  const INPUT_MAX_LENGTH = 250

  const optionsTitre = actionsPredefinies.concat({
    id: 'autre',
    titre: TITRE_AUTRE,
  })

  const [showHelperCategories, setShowHelperCategories] =
    useState<boolean>(false)

  const formRef = useRef<HTMLFormElement>(null)
  const modalRef = useRef<{
    closeModal: (e: MouseEvent) => void
  }>(null)

  function permuterAffichageHelperCategories() {
    setShowHelperCategories(!showHelperCategories)
  }

  function modifierStatut(
    nouveauStatut: StatutAction.AFaire | StatutAction.Terminee
  ) {
    setDateAction({ value: dateEcheance })
    if (nouveauStatut === StatutAction.Terminee) {
      setDateRealisation({ value: dateFinReelle ?? DateTime.now().toISODate() })
    } else {
      setDateRealisation({ value: undefined })
    }
    setStatut(nouveauStatut)
  }

  function formulaireEstValide(): boolean {
    const categorieEstValide = validerCategorie()
    const titreEstValide = validerTitre() && validerTitrePersonnalise()
    const dateActionEstValide = validerDateAction()
    const dateRealisationEstValide = validerDateRealisation()

    return Boolean(
      categorieEstValide &&
        titreEstValide &&
        dateActionEstValide &&
        dateRealisationEstValide
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

  function validerDateAction() {
    const unAnAvant = DateTime.now().minus({ year: 1, day: 1 })
    const deuxAnsApres = DateTime.now().plus({ year: 2 })
    if (statut === StatutAction.Terminee) return true

    if (!dateAction.value) {
      setDateAction({
        ...dateAction,
        error:
          'Le champ “Date de l’action” est vide. Renseignez une date de l’action.',
      })
      return false
    } else if (
      !dateIsInInterval(
        DateTime.fromISO(dateAction.value),
        unAnAvant,
        deuxAnsApres
      )
    ) {
      setDateAction({
        ...dateAction,
        error: `Le champ “Date de l’action” est invalide. Le date attendue est comprise entre le ${toShortDate(
          unAnAvant
        )} et le ${toShortDate(deuxAnsApres)}.`,
      })
      return false
    }
    return true
  }

  function validerDateRealisation() {
    const unAnAvant = DateTime.now().minus({ year: 1, day: 1 })
    const deuxAnsApres = DateTime.now().plus({ year: 2 })
    if (statut === StatutAction.AFaire) return true

    if (!dateRealisation.value) {
      setDateRealisation({
        ...dateRealisation,
        error:
          'Le champ “Date de réalisation” est vide. Renseignez une date de l’action.',
      })
      return false
    } else if (
      !dateIsInInterval(
        DateTime.fromISO(dateRealisation.value),
        unAnAvant,
        deuxAnsApres
      )
    ) {
      setDateRealisation({
        ...dateRealisation,
        error: `Le champ “Date de réalisation” est invalide. Le date attendue est comprise entre le ${toShortDate(
          unAnAvant
        )} et le ${toShortDate(deuxAnsApres)}.`,
      })
      return false
    }
    return true
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

    if (dateAction.error) {
      const ancre = '#date-action'
      const label = 'Le champ Date de l’action est vide.'
      const titreChamp = 'Date'

      erreurs.push({ ancre, label, titreChamp })
    }

    if (dateRealisation.error) {
      const ancre = '#date-realisation'
      const label = 'Le champ Date de réalisation est vide.'
      const titreChamp = 'Date'

      erreurs.push({ ancre, label, titreChamp })
    }

    return erreurs
  }

  async function handleSoumettreAction(e: FormEvent) {
    e.preventDefault()

    if (!formulaireEstValide()) {
      formRef.current!.scrollIntoView({ behavior: 'smooth' })
      return Promise.resolve()
    }

    const actionFormData: ActionFormData = {
      codeCategorie: codeCategorie.value!,
      titre:
        titre.value !== TITRE_AUTRE ? titre.value! : titrePersonnalise.value!,
      dateEcheance:
        statut === StatutAction.Terminee
          ? dateRealisation.value!
          : dateAction.value!,
      dateFinReelle: dateRealisation.value,
      description,
      statut,
    }
    await soumettreAction(actionFormData)
  }

  return (
    <>
      <RecapitulatifErreursFormulaire erreurs={getErreurs()} />

      <form
        id='edition-action-form'
        onSubmit={handleSoumettreAction}
        noValidate={true}
        ref={formRef}
      >
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
            defaultValue={codeCategorie.value}
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
            defaultValue={titre.value}
            invalid={Boolean(titre.error)}
          >
            {optionsTitre.map(({ id, titre: titreAction }) => (
              <option key={id}>{titreAction}</option>
            ))}
          </Select>

          {titre.value === TITRE_AUTRE && (
            <>
              <Label htmlFor='titre-action--personnalise' inputRequired={true}>
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
                defaultValue={titrePersonnalise.value}
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
                isSelected={statut === StatutAction.AFaire}
                label='À faire'
                name='statut-action'
                onChange={() => modifierStatut(StatutAction.AFaire)}
              />
              <RadioBox
                isSelected={statut === StatutAction.Terminee}
                label='Terminée'
                name='statut-action'
                onChange={() => modifierStatut(StatutAction.Terminee)}
              />
            </div>
          </fieldset>

          {statut === StatutAction.AFaire && (
            <>
              <Label htmlFor='date-action' inputRequired={true}>
                Date de l’action
              </Label>
              {dateAction.error && (
                <InputError id='date-action--error' className='mb-2'>
                  {dateAction.error}
                </InputError>
              )}
              <Input
                type='date'
                id='date-action'
                required={true}
                value={dateAction.value ?? ''}
                onChange={(value: string) => setDateAction({ value })}
                onBlur={validerDateAction}
                invalid={Boolean(dateAction.error)}
              />
              <div className='gap-2 flex flex-wrap'>
                <BoutonDateRapide
                  date={DateTime.now()}
                  label="Aujourd'hui"
                  ariaControls='date-action'
                  onClick={(date) => {
                    setDateAction({ value: date })
                  }}
                />
                <BoutonDateRapide
                  date={DateTime.now().plus({ day: 1 })}
                  label='Demain'
                  ariaControls='date-action'
                  onClick={(date) => {
                    setDateAction({ value: date })
                  }}
                />
                <BoutonDateRapide
                  date={DateTime.now().plus({ week: 1 }).startOf('week')}
                  label='Semaine prochaine'
                  ariaControls='date-action'
                  onClick={(date) => {
                    setDateAction({ value: date })
                  }}
                />
              </div>
            </>
          )}

          {statut === StatutAction.Terminee && (
            <>
              <Label htmlFor='date-realisation' inputRequired={true}>
                Date de réalisation
              </Label>
              {dateRealisation.error && (
                <InputError id='date-realisation--error' className='mb-2'>
                  {dateRealisation.error}
                </InputError>
              )}
              <Input
                type='date'
                id='date-realisation'
                required={true}
                value={dateRealisation.value ?? ''}
                onChange={(value: string) => setDateRealisation({ value })}
                onBlur={validerDateRealisation}
                invalid={Boolean(dateRealisation.error)}
              />
            </>
          )}
        </Etape>

        <div className='mt-8 flex justify-center'>
          <ButtonLink href={returnTo} style={ButtonStyle.SECONDARY}>
            Annuler
          </ButtonLink>
          <Button type='submit' className='ml-6'>
            {!action && (
              <IconComponent
                name={IconName.Add}
                focusable={false}
                aria-hidden={true}
                className='mr-2 w-4 h-4'
              />
            )}
            {action ? 'Enregistrer les modifications' : 'Créer l’action'}
          </Button>
        </div>
      </form>

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
    </>
  )
}

function BoutonDateRapide({
  date,
  ariaControls,
  label,
  onClick,
}: {
  date: DateTime
  ariaControls: string
  label: string
  onClick: (date: string) => void
}) {
  return (
    <input
      type='button'
      id={label}
      aria-controls={ariaControls}
      className='text-s-medium border border-solid border-grey_700 rounded-base px-2 py-1 cursor-pointer hover:border-primary hover:bg-primary_lighten'
      value={`${label} (${toWeekday(date)})`}
      onClick={() => {
        onClick(date.toISODate())
      }}
    />
  )
}

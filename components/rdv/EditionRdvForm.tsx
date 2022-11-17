import { DateTime } from 'luxon'
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'

import JeunesMultiselectAutocomplete from 'components/jeune/JeunesMultiselectAutocomplete'
import {
  RequiredValue,
  RequiredValue as ValueWithError,
} from 'components/RequiredValue'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import { Etape } from 'components/ui/Form/Etape'
import Input from 'components/ui/Form/Input'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import Select from 'components/ui/Form/Select'
import { Switch } from 'components/ui/Form/Switch'
import Textarea from 'components/ui/Form/Textarea'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { Conseiller, StructureConseiller } from 'interfaces/conseiller'
import {
  Evenement,
  isCodeTypeAnimationCollective,
  TYPE_EVENEMENT,
  TypeEvenement,
} from 'interfaces/evenement'
import { BaseJeune } from 'interfaces/jeune'
import { EvenementFormData } from 'interfaces/json/evenement'
import { modalites } from 'referentiel/rdv'
import {
  DATE_DASH_SEPARATOR,
  TIME_24_SIMPLE,
  toFrenchFormat,
  toFrenchString,
} from 'utils/date'

interface EditionRdvFormProps {
  jeunesConseiller: BaseJeune[]
  typesRendezVous: TypeEvenement[]
  redirectTo: string
  aDesBeneficiairesDUnAutrePortefeuille: boolean
  conseillerIsCreator: boolean
  soumettreRendezVous: (payload: EvenementFormData) => Promise<void>
  leaveWithChanges: () => void
  onChanges: (hasChanges: boolean) => void
  conseiller?: Conseiller
  rdv?: Evenement
  idJeune?: string
  showConfirmationModal: (payload: EvenementFormData) => void
  renseignerAgence: () => void
  recupererJeunesDeLEtablissement: () => Promise<BaseJeune[]>
}

export function EditionRdvForm({
  jeunesConseiller,
  recupererJeunesDeLEtablissement,
  typesRendezVous,
  redirectTo,
  aDesBeneficiairesDUnAutrePortefeuille,
  conseillerIsCreator,
  conseiller,
  soumettreRendezVous,
  leaveWithChanges,
  onChanges,
  rdv,
  idJeune,
  showConfirmationModal,
  renseignerAgence,
}: EditionRdvFormProps) {
  const defaultJeunes = initJeunesFromRdvOrIdJeune()
  const [jeunesEtablissement, setJeunesEtablissement] = useState<BaseJeune[]>(
    []
  )
  const [idsJeunes, setIdsJeunes] = useState<RequiredValue<string[]>>({
    value: defaultJeunes.map(({ id }) => id),
  })
  const [codeTypeRendezVous, setCodeTypeRendezVous] = useState<string>(
    rdv?.type.code ?? ''
  )

  const [precisionType, setPrecisionType] = useState<RequiredValue>({
    value: rdv?.precisionType ?? '',
  })
  const [showPrecisionType, setShowPrecisionType] = useState<boolean>(
    Boolean(rdv?.precisionType)
  )
  const [modalite, setModalite] = useState<string>(rdv?.modality ?? '')
  const regexDate = /^\d{4}-(0\d|1[0-2])-([0-2]\d|3[01])$/
  const dateRdv = rdv ? DateTime.fromISO(rdv.date) : undefined
  const localDate = dateRdv ? toFrenchFormat(dateRdv, DATE_DASH_SEPARATOR) : ''
  const [date, setDate] = useState<RequiredValue>({ value: localDate })
  const regexHoraire = /^([0-1]\d|2[0-3]):[0-5]\d$/
  const localTime = dateRdv
    ? toFrenchString(dateRdv, DateTime.TIME_24_SIMPLE)
    : ''
  const [horaire, setHoraire] = useState<RequiredValue>({ value: localTime })
  const regexDuree = /^\d{2}:\d{2}$/
  const dureeRdv = dureeFromMinutes(rdv?.duree)
  const [duree, setDuree] = useState<RequiredValue>({ value: dureeRdv })
  const [adresse, setAdresse] = useState<string>(rdv?.adresse ?? '')
  const [organisme, setOrganisme] = useState<string>(rdv?.organisme ?? '')
  const [isConseillerPresent, setConseillerPresent] = useState<boolean>(
    rdv?.presenceConseiller ?? true
  )
  const [sendEmailInvitation, setSendEmailInvitation] = useState<boolean>(
    Boolean(rdv?.invitation)
  )
  const [titre, setTitre] = useState<RequiredValue>({ value: rdv?.titre ?? '' })
  const [description, setDescription] = useState<ValueWithError>({
    value: rdv?.commentaire ?? '',
  })

  const isAgenceNecessaire =
    isCodeTypeAnimationCollective(codeTypeRendezVous) && !conseiller?.agence
  const afficherSuiteFormulaire =
    codeTypeRendezVous &&
    (!isCodeTypeAnimationCollective(codeTypeRendezVous) || conseiller?.agence)
  const labelAgence =
    conseiller?.structure === StructureConseiller.MILO
      ? 'Mission locale'
      : 'agence'

  const afficherMessageBeneficiairesAutrePortefeuille =
    aDesBeneficiairesDUnAutrePortefeuille ||
    idsJeunes.value.some(
      (id) => !jeunesConseiller.some((jeune) => jeune.id === id)
    )

  function buildOptionsJeunes(): Array<
    BaseJeune & { isAutrePortefeuille: boolean }
  > {
    if (!isCodeTypeAnimationCollective(codeTypeRendezVous)) {
      return jeunesConseiller.map((jeune) => ({
        ...jeune,
        isAutrePortefeuille: false,
      }))
    }

    return jeunesEtablissement.map((jeune) => ({
      ...jeune,
      isAutrePortefeuille: !jeunesConseiller.some(({ id }) => jeune.id === id),
    }))
  }

  function initJeunesFromRdvOrIdJeune(): Array<
    BaseJeune & { isAutrePortefeuille: boolean }
  > {
    if (rdv) {
      return rdv.jeunes.map((jeune) => ({
        ...jeune,
        isAutrePortefeuille: !jeunesConseiller.some(
          ({ id }) => jeune.id === id
        ),
      }))
    }
    if (idJeune) {
      const jeune = jeunesConseiller.find(({ id }) => id === idJeune)!
      return [{ ...jeune, isAutrePortefeuille: false }]
    }
    return []
  }

  function formHasChanges(): boolean {
    if (!rdv) {
      return Boolean(
        idsJeunes.value.length ||
          codeTypeRendezVous ||
          modalite ||
          date.value ||
          horaire.value ||
          duree.value ||
          titre.value ||
          adresse ||
          organisme ||
          description.value
      )
    }

    const previousIds = rdv.jeunes.map(({ id }) => id).sort()
    idsJeunes.value.sort()
    return (
      previousIds.toString() !== idsJeunes.value.toString() ||
      modalite !== rdv.modality ||
      date.value !== localDate ||
      horaire.value !== localTime ||
      duree.value !== dureeRdv ||
      adresse !== rdv.adresse ||
      organisme !== rdv.organisme ||
      titre.value !== rdv.titre ||
      description.value !== rdv.commentaire ||
      isConseillerPresent !== rdv.presenceConseiller
    )
  }

  function formIsValid(): boolean {
    return (
      typeIsValid() &&
      beneficiairesAreValid(idsJeunes.value) &&
      dateIsValid() &&
      horaireIsValid() &&
      dureeIsValid() &&
      titreIsValid() &&
      descriptionIsValid()
    )
  }

  async function handleSelectedTypeRendezVous(value: string) {
    setCodeTypeRendezVous(value)
    setShowPrecisionType(value === TYPE_EVENEMENT.Autre)
    if (value === TYPE_EVENEMENT.EntretienIndividuelConseiller) {
      setConseillerPresent(true)
    }
  }

  function updateIdsJeunes(selectedIds: string[]) {
    setIdsJeunes({
      value: selectedIds,
      error: !beneficiairesAreValid(selectedIds)
        ? "Aucun bénéficiaire n'est renseigné. Veuillez sélectionner au moins un bénéficiaire."
        : undefined,
    })
  }

  function validateTypeEvenementAutre() {
    if (!precisionType.value) {
      setPrecisionType({
        value: precisionType.value,
        error:
          "Le champ Préciser n'est pas renseigné. Veuillez préciser le type d’événement.",
      })
    }
  }

  function beneficiairesAreValid(idsBeneficiaires: string[]): boolean {
    if (isCodeTypeAnimationCollective(codeTypeRendezVous)) return true
    return idsBeneficiaires.length > 0
  }

  function dateIsValid(): boolean {
    return regexDate.test(date.value)
  }

  function validateDate() {
    if (!dateIsValid()) {
      setDate({
        ...date,
        error:
          "Le champ date n'est pas valide. Veuillez respecter le format jj/mm/aaaa",
      })
    }
  }

  function horaireIsValid() {
    return regexHoraire.test(horaire.value)
  }

  function validateHoraire() {
    if (!horaire.value) {
      setHoraire({
        ...horaire,
        error:
          "Le champ heure n'est pas renseigné. Veuillez renseigner une heure.",
      })
    } else if (!horaireIsValid()) {
      setHoraire({
        ...horaire,
        error:
          "Le champ heure n'est pas valide. Veuillez respecter le format hh:mm",
      })
    }
  }

  function dureeIsValid() {
    return regexDuree.test(duree.value)
  }

  function validateDuree() {
    if (!duree.value) {
      setDuree({
        ...duree,
        error:
          "Le champ durée n'est pas renseigné. Veuillez renseigner une durée.",
      })
    } else if (!dureeIsValid()) {
      setDuree({
        ...duree,
        error:
          "Le champ durée n'est pas valide. Veuillez respecter le format hh:mm",
      })
    }
  }

  function typeIsValid(): boolean {
    if (!codeTypeRendezVous) return false
    if (codeTypeRendezVous === TYPE_EVENEMENT.Autre)
      return Boolean(precisionType.value)
    return true
  }

  function titreIsValid(): boolean {
    return (
      !isCodeTypeAnimationCollective(codeTypeRendezVous) || Boolean(titre.value)
    )
  }

  function validateTitre() {
    if (isCodeTypeAnimationCollective(codeTypeRendezVous) && !titre.value) {
      setTitre({
        ...titre,
        error:
          'Le champ Titre n’est pas renseigné. Veuillez renseigner un titre.',
      })
    } else {
      setTitre({ value: titre.value })
    }
  }

  function descriptionIsValid(): boolean {
    return description.value.length < 250
  }

  function validateDescription() {
    if (description.value.length >= 250) {
      setDescription({
        ...description,
        error:
          'Vous avez dépassé le nombre maximal de caractères. Veuillez retirer des caractères.',
      })
    }
  }

  function typeEntretienIndividuelConseillerSelected() {
    return codeTypeRendezVous === TYPE_EVENEMENT.EntretienIndividuelConseiller
  }

  function handlePresenceConseiller(e: ChangeEvent<HTMLInputElement>) {
    if (typeEntretienIndividuelConseillerSelected()) {
      setConseillerPresent(true)
    } else {
      setConseillerPresent(e.target.checked)
    }
  }

  async function handleSoumettreRdv(e: FormEvent) {
    e.preventDefault()

    if (!formHasChanges()) return Promise.resolve()
    if (!formIsValid()) return Promise.resolve()

    const [dureeHeures, dureeMinutes] = duree.value.split(':')
    const dateTime: DateTime = DateTime.fromFormat(
      `${date.value} ${horaire.value}`,
      `${DATE_DASH_SEPARATOR} ${TIME_24_SIMPLE}`
    )
    const payload: EvenementFormData = {
      jeunesIds: idsJeunes.value,
      type: codeTypeRendezVous,
      date: dateTime.toISO(),
      duration: parseInt(dureeHeures, 10) * 60 + parseInt(dureeMinutes, 10),
      presenceConseiller: isConseillerPresent,
      invitation: sendEmailInvitation,
      precision:
        codeTypeRendezVous === TYPE_EVENEMENT.Autre
          ? precisionType.value
          : undefined,
      modality: modalite || undefined,
      adresse: adresse || undefined,
      organisme: organisme || undefined,
      titre: titre.value || undefined,
      comment: description.value || undefined,
    }
    if (!conseillerIsCreator && sendEmailInvitation) {
      showConfirmationModal(payload)
    } else {
      await soumettreRendezVous(payload)
    }
  }

  useEffect(() => {
    if (formHasChanges()) onChanges(true)
    else onChanges(false)
  })

  useEffect(() => {
    if (
      isCodeTypeAnimationCollective(codeTypeRendezVous) &&
      !jeunesEtablissement.length
    ) {
      recupererJeunesDeLEtablissement().then(setJeunesEtablissement)
    }
  }, [
    codeTypeRendezVous,
    jeunesEtablissement.length,
    recupererJeunesDeLEtablissement,
  ])

  function emailInvitationText(conseillerIsCreator: boolean) {
    if (conseillerIsCreator) {
      return `Intégrer cet événement à mon agenda via l’adresse e-mail suivante : ${conseiller?.email}`
    } else {
      return "Le créateur de l’événement recevra un mail pour l'informer de la modification."
    }
  }

  return (
    <form onSubmit={handleSoumettreRdv}>
      {afficherMessageBeneficiairesAutrePortefeuille && (
        <div className='mb-6'>
          <InformationMessage content='Cet événement concerne des bénéficiaires que vous ne suivez pas et qui ne sont pas dans votre portefeuille' />
        </div>
      )}

      <p className='text-s-bold my-6'>
        Tous les champs avec * sont obligatoires
      </p>

      <Etape numero={1} titre='Type d’événement'>
        <Label htmlFor='typeEvenement' inputRequired={true}>
          Type
        </Label>
        <Select
          id='typeEvenement'
          defaultValue={codeTypeRendezVous}
          required={true}
          disabled={Boolean(rdv)}
          onChange={handleSelectedTypeRendezVous}
        >
          {typesRendezVous.map(({ code, label }) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </Select>

        {showPrecisionType && (
          <>
            <Label
              htmlFor='typeEvenement-autre'
              inputRequired={true}
              withBulleMessageSensible={true}
            >
              Préciser
            </Label>
            {precisionType.error && (
              <InputError id='typeEvenement-autre--error' className='mb-2'>
                {precisionType.error}
              </InputError>
            )}
            <Input
              type='text'
              id='typeEvenement-autre'
              required={true}
              disabled={Boolean(rdv)}
              defaultValue={precisionType.value}
              onChange={(value: string) => setPrecisionType({ value })}
              onBlur={validateTypeEvenementAutre}
              invalid={Boolean(precisionType.error)}
            />
          </>
        )}

        {isAgenceNecessaire && (
          <div className='bg-warning_lighten rounded-medium p-6'>
            <p className='flex justify-center items-center text-base-bold text-warning mb-2'>
              <IconComponent
                focusable={false}
                aria-hidden={true}
                className='w-4 h-4 mr-2 fill-warning'
                name={IconName.Important}
              />
              Votre {labelAgence} n’est pas renseignée
            </p>
            <p className='text-base-regular text-warning mb-6'>
              Pour créer une information collective ou un atelier vous devez
              renseigner votre {labelAgence} dans votre profil.
            </p>
            <Button
              type='button'
              style={ButtonStyle.PRIMARY}
              onClick={renseignerAgence}
              className='mx-auto'
            >
              Renseigner votre {labelAgence}
            </Button>
          </div>
        )}
      </Etape>

      {afficherSuiteFormulaire && (
        <>
          <Etape numero={2} titre='Description'>
            <Label
              htmlFor='titre'
              inputRequired={isCodeTypeAnimationCollective(codeTypeRendezVous)}
            >
              Titre
            </Label>
            {titre.error && (
              <InputError id='titre--error' className='mb-2'>
                {titre.error}
              </InputError>
            )}
            <Input
              id='titre'
              type='text'
              defaultValue={titre.value}
              required={isCodeTypeAnimationCollective(codeTypeRendezVous)}
              invalid={Boolean(titre.error)}
              onChange={(value: string) => setTitre({ value })}
              onBlur={validateTitre}
            />

            <Label htmlFor='description' withBulleMessageSensible={true}>
              {{
                main: 'Description',
                helpText: '250 caractères maximum',
              }}
            </Label>
            {description.error && (
              <InputError id='description--error' className='mb-2'>
                {description.error}
              </InputError>
            )}
            <Textarea
              id='description'
              defaultValue={description.value}
              rows={3}
              maxLength={250}
              onChange={(value: string) => setDescription({ value })}
              invalid={Boolean(description.error)}
              onBlur={validateDescription}
            />
          </Etape>
          <Etape numero={3} titre='Ajout de bénéficiaires'>
            {isCodeTypeAnimationCollective(codeTypeRendezVous) && (
              <div className='mb-4'>
                <InformationMessage content='Pour les animations collectives, l’ajout de bénéficiaires est facultatif' />
              </div>
            )}
            <JeunesMultiselectAutocomplete
              jeunes={buildOptionsJeunes()}
              typeSelection='Bénéficiaires'
              defaultJeunes={defaultJeunes}
              onUpdate={updateIdsJeunes}
              error={idsJeunes.error}
              required={!isCodeTypeAnimationCollective(codeTypeRendezVous)}
            />
          </Etape>

          <Etape numero={4} titre='Lieu et date'>
            <Label htmlFor='modalite'>Modalité</Label>
            <Select
              id='modalite'
              defaultValue={modalite}
              onChange={setModalite}
            >
              {modalites.map((md) => (
                <option key={md} value={md}>
                  {md}
                </option>
              ))}
            </Select>
            <Label htmlFor='date' inputRequired={true}>
              {{ main: 'Date', helpText: ' (format : jj/mm/aaaa)' }}
            </Label>
            {date.error && (
              <InputError id='date--error' className='mb-2'>
                {date.error}
              </InputError>
            )}
            <Input
              type='date'
              id='date'
              defaultValue={date.value}
              required={true}
              onChange={(value: string) => setDate({ value })}
              onBlur={validateDate}
              invalid={Boolean(date.error)}
            />

            <Label htmlFor='horaire' inputRequired={true}>
              {{ main: 'Heure', helpText: '(format : hh:mm)' }}
            </Label>
            {horaire.error && (
              <InputError id='horaire--error' className='mb-2'>
                {horaire.error}
              </InputError>
            )}
            <Input
              type='time'
              id='horaire'
              defaultValue={horaire.value}
              required={true}
              onChange={(value: string) => setHoraire({ value })}
              onBlur={validateHoraire}
              invalid={Boolean(horaire.error)}
              aria-invalid={horaire.error ? true : undefined}
              aria-describedby={horaire.error ? 'horaire--error' : undefined}
            />

            <Label htmlFor='duree' inputRequired={true}>
              {{ main: 'Durée', helpText: '(format : hh:mm)' }}
            </Label>
            {duree.error && (
              <InputError id='duree--error' className='mb-2'>
                {duree.error}
              </InputError>
            )}
            <Input
              type='time'
              id='duree'
              required={true}
              defaultValue={duree.value}
              onChange={(value: string) => setDuree({ value })}
              onBlur={validateDuree}
              invalid={Boolean(duree.error)}
            />

            <Label htmlFor='adresse'>
              {{ main: 'Adresse', helpText: 'Ex : 12 rue duc, Brest' }}
            </Label>
            <Input
              type='text'
              id='adresse'
              defaultValue={adresse}
              onChange={setAdresse}
              icon='location'
            />

            <Label htmlFor='organisme'>
              {{
                main: 'Organisme',
                helpText: 'Ex : prestataire, entreprise, etc.',
              }}
            </Label>
            <Input
              type='text'
              id='organisme'
              defaultValue={organisme}
              onChange={setOrganisme}
            />
          </Etape>

          <Etape numero={5} titre='Gestion des accès'>
            {!conseillerIsCreator && (
              <div className='mb-6'>
                <InformationMessage
                  content={`L’événement a été créé par un autre conseiller : ${
                    rdv!.createur.prenom
                  } ${
                    rdv!.createur.nom
                  }. Vous ne recevrez pas d'invitation dans votre agenda`}
                />
              </div>
            )}

            <div className='flex items-center mb-8'>
              <label htmlFor='presenceConseiller' className='flex items-center'>
                <span className='w-64 mr-4'>
                  Informer les bénéficiaires qu’un conseiller sera présent à
                  l’événement
                </span>
                <Switch
                  id='presenceConseiller'
                  checked={isConseillerPresent}
                  disabled={typeEntretienIndividuelConseillerSelected()}
                  onChange={handlePresenceConseiller}
                />
              </label>
            </div>

            <div className='flex items-center mb-8'>
              <label htmlFor='emailInvitation' className='flex items-center'>
                <span className='w-64 mr-4'>
                  {emailInvitationText(conseillerIsCreator)}
                </span>
                <Switch
                  id='emailInvitation'
                  disabled={Boolean(rdv)}
                  checked={sendEmailInvitation}
                  onChange={(e) => setSendEmailInvitation(e.target.checked)}
                />
              </label>
            </div>
          </Etape>

          <div className='flex justify-center'>
            {!formHasChanges() && (
              <ButtonLink
                href={redirectTo}
                style={ButtonStyle.SECONDARY}
                className='mr-3'
              >
                Annuler {rdv ? 'la modification' : ''}
              </ButtonLink>
            )}
            {formHasChanges() && (
              <Button
                type='button'
                label={`Quitter la ${
                  rdv ? 'modification' : 'création'
                } de l’événement`}
                onClick={leaveWithChanges}
                style={ButtonStyle.SECONDARY}
                className='mr-3'
              >
                Annuler {rdv ? ' la modification' : ''}
              </Button>
            )}

            {rdv && (
              <Button
                type='submit'
                disabled={!formHasChanges() || !formIsValid()}
              >
                Modifier l’événement
              </Button>
            )}
            {!rdv && (
              <Button
                type='submit'
                disabled={!formHasChanges() || !formIsValid()}
              >
                <IconComponent
                  name={IconName.Add}
                  focusable={false}
                  aria-hidden={true}
                  className='mr-2 w-4 h-4'
                />
                Créer l’événement
              </Button>
            )}
          </div>
        </>
      )}
    </form>
  )
}

function dureeFromMinutes(duration?: number): string {
  if (!duration) return ''

  const hours = Math.floor(duration / 60)
  const minutes = duration % 60
  return String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0')
}

import { DateTime } from 'luxon'
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'

import {
  BeneficiaireIndicateurPortefeuille,
  BeneficiaireIndicateurPresent,
} from 'components/jeune/BeneficiaireIndicateurs'
import BeneficiairesMultiselectAutocomplete, {
  OptionBeneficiaire,
} from 'components/jeune/BeneficiairesMultiselectAutocomplete'
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
  estClos,
  Evenement,
  isCodeTypeAnimationCollective,
  TYPE_EVENEMENT,
  TypeEvenement,
} from 'interfaces/evenement'
import { BaseJeune, getNomJeuneComplet } from 'interfaces/jeune'
import { EvenementFormData } from 'interfaces/json/evenement'
import { modalites } from 'referentiel/evenement'
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
  conseillerIsCreator: boolean
  soumettreRendezVous: (payload: EvenementFormData) => Promise<void>
  leaveWithChanges: () => void
  onChanges: (hasChanges: boolean) => void
  conseiller?: Conseiller
  evenement?: Evenement
  idJeune?: string
  showConfirmationModal: (payload: EvenementFormData) => void
  renseignerAgence: () => void
  recupererJeunesDeLEtablissement: () => Promise<BaseJeune[]>
  onBeneficiairesDUnAutrePortefeuille: (b: boolean) => void
}

export function EditionRdvForm({
  jeunesConseiller,
  recupererJeunesDeLEtablissement,
  typesRendezVous,
  redirectTo,
  onBeneficiairesDUnAutrePortefeuille,
  conseillerIsCreator,
  conseiller,
  soumettreRendezVous,
  leaveWithChanges,
  onChanges,
  evenement,
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
  const [codeTypeRendezVous, setCodeTypeRendezVous] = useState<
    string | undefined
  >(evenement?.type.code)

  const [precisionType, setPrecisionType] = useState<
    RequiredValue<string | undefined>
  >({
    value: evenement?.precisionType,
  })
  const [showPrecisionType, setShowPrecisionType] = useState<boolean>(
    Boolean(evenement?.precisionType)
  )
  const [modalite, setModalite] = useState<string | undefined>(
    evenement?.modality
  )
  const regexDate = /^\d{4}-(0\d|1[0-2])-([0-2]\d|3[01])$/
  const dateRdv = evenement && DateTime.fromISO(evenement.date)
  const localDate = dateRdv && toFrenchFormat(dateRdv, DATE_DASH_SEPARATOR)
  const [date, setDate] = useState<RequiredValue<string | undefined>>({
    value: localDate,
  })
  const regexHoraire = /^([0-1]\d|2[0-3]):[0-5]\d$/
  const localTime = dateRdv && toFrenchString(dateRdv, DateTime.TIME_24_SIMPLE)
  const [horaire, setHoraire] = useState<RequiredValue<string | undefined>>({
    value: localTime,
  })
  const regexDuree = /^\d{2}:\d{2}$/
  const dureeRdv = dureeFromMinutes(evenement?.duree)
  const [duree, setDuree] = useState<RequiredValue<string | undefined>>({
    value: dureeRdv,
  })
  const [adresse, setAdresse] = useState<string | undefined>(evenement?.adresse)
  const [organisme, setOrganisme] = useState<string | undefined>(
    evenement?.organisme
  )
  const [isConseillerPresent, setConseillerPresent] = useState<boolean>(
    evenement?.presenceConseiller ?? true
  )
  const [sendEmailInvitation, setSendEmailInvitation] = useState<boolean>(
    Boolean(evenement?.invitation)
  )
  const [titre, setTitre] = useState<RequiredValue<string | undefined>>({
    value: evenement?.titre,
  })
  const [description, setDescription] = useState<
    ValueWithError<string | undefined>
  >({
    value: evenement?.commentaire,
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

  function estUnBeneficiaireDuConseiller(
    idBeneficiaireAVerifier: string
  ): boolean {
    return jeunesConseiller.some(({ id }) => idBeneficiaireAVerifier === id)
  }

  function buildOptionsJeunes(): OptionBeneficiaire[] {
    if (!isCodeTypeAnimationCollective(codeTypeRendezVous)) {
      return jeunesConseiller.map((jeune) => ({
        id: jeune.id,
        value: getNomJeuneComplet(jeune),
        avecIndicateur: false,
      }))
    }

    if (evenement && estClos(evenement)) {
      return []
    }

    return jeunesEtablissement.map((jeune) => ({
      id: jeune.id,
      value: getNomJeuneComplet(jeune),
      avecIndicateur: !estUnBeneficiaireDuConseiller(jeune.id),
    }))
  }

  function initJeunesFromRdvOrIdJeune(): OptionBeneficiaire[] {
    if (evenement && estClos(evenement)) {
      return evenement.jeunes.map((jeune) => ({
        id: jeune.id,
        value: getNomJeuneComplet(jeune),
        avecIndicateur: jeune.futPresent,
      }))
    }

    if (evenement) {
      return evenement.jeunes.map((jeune) => ({
        id: jeune.id,
        value: getNomJeuneComplet(jeune),
        avecIndicateur: !estUnBeneficiaireDuConseiller(jeune.id),
      }))
    }

    if (idJeune) {
      const jeune = jeunesConseiller.find(({ id }) => id === idJeune)!
      return [
        {
          id: jeune.id,
          value: getNomJeuneComplet(jeune),
          avecIndicateur: false,
        },
      ]
    }

    return []
  }

  function formHasChanges(): boolean {
    if (!evenement) {
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

    const previousIds = evenement.jeunes.map(({ id }) => id).sort()
    const currentIds = [...idsJeunes.value].sort()
    return (
      previousIds.toString() !== currentIds.toString() ||
      modalite !== evenement.modality ||
      date.value !== localDate ||
      horaire.value !== localTime ||
      duree.value !== dureeRdv ||
      adresse !== evenement.adresse ||
      organisme !== evenement.organisme ||
      titre.value !== evenement.titre ||
      description.value !== evenement.commentaire ||
      isConseillerPresent !== evenement.presenceConseiller
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
    onBeneficiairesDUnAutrePortefeuille(
      selectedIds.some((id) => !estUnBeneficiaireDuConseiller(id))
    )
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
    return Boolean(date.value && regexDate.test(date.value))
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
    return Boolean(horaire.value && regexHoraire.test(horaire.value))
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

  function dureeIsValid(): boolean {
    return Boolean(duree.value && regexDuree.test(duree.value))
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
    return !description.value || description.value.length < 250
  }

  function validateDescription() {
    if (!descriptionIsValid()) {
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

    const [dureeHeures, dureeMinutes] = duree.value!.split(':')
    const dateTime: DateTime = DateTime.fromFormat(
      `${date.value} ${horaire.value}`,
      `${DATE_DASH_SEPARATOR} ${TIME_24_SIMPLE}`
    )
    const dureeEnMinutes =
      parseInt(dureeHeures, 10) * 60 + parseInt(dureeMinutes, 10)
    const payload: EvenementFormData = {
      jeunesIds: idsJeunes.value,
      type: codeTypeRendezVous!,
      date: dateTime.toISO(),
      duration: dureeEnMinutes,
      presenceConseiller: isConseillerPresent,
      invitation: sendEmailInvitation,
      precision:
        codeTypeRendezVous === TYPE_EVENEMENT.Autre
          ? precisionType.value
          : undefined,
      modality: modalite,
      adresse,
      organisme,
      titre: titre.value,
      comment: description.value,
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
          disabled={Boolean(evenement)}
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
              disabled={Boolean(evenement)}
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
              disabled={evenement && estClos(evenement)}
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
              disabled={evenement && estClos(evenement)}
            />
          </Etape>

          <Etape numero={3} titre='Ajout de bénéficiaires'>
            {isCodeTypeAnimationCollective(codeTypeRendezVous) &&
              (!evenement || !estClos(evenement)) && (
                <div className='mb-4'>
                  <InformationMessage content='Pour les événements de type Atelier ou Information collective, l’ajout de bénéficiaires est facultatif' />
                </div>
              )}
            <BeneficiairesMultiselectAutocomplete
              beneficiaires={buildOptionsJeunes()}
              typeSelection='Bénéficiaires'
              defaultBeneficiaires={defaultJeunes}
              onUpdate={updateIdsJeunes}
              error={idsJeunes.error}
              required={!isCodeTypeAnimationCollective(codeTypeRendezVous)}
              disabled={evenement && estClos(evenement)}
              renderIndicateur={
                evenement && estClos(evenement)
                  ? BeneficiaireIndicateurPresent
                  : BeneficiaireIndicateurPortefeuille
              }
            />
          </Etape>

          <Etape numero={4} titre='Lieu et date'>
            <Label htmlFor='modalite'>Modalité</Label>
            <Select
              id='modalite'
              defaultValue={modalite}
              onChange={setModalite}
              disabled={evenement && estClos(evenement)}
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
              disabled={evenement && estClos(evenement)}
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
              disabled={evenement && estClos(evenement)}
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
              disabled={evenement && estClos(evenement)}
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
              disabled={evenement && estClos(evenement)}
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
              disabled={evenement && estClos(evenement)}
            />
          </Etape>

          <Etape numero={5} titre='Gestion des accès'>
            {!conseillerIsCreator && (
              <div className='mb-6'>
                <InformationMessage
                  content={`L’événement a été créé par un autre conseiller : ${
                    evenement!.createur.prenom
                  } ${
                    evenement!.createur.nom
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
                  disabled={
                    typeEntretienIndividuelConseillerSelected() ||
                    (evenement && estClos(evenement))
                  }
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
                  disabled={Boolean(evenement)}
                  checked={sendEmailInvitation}
                  onChange={(e) => setSendEmailInvitation(e.target.checked)}
                />
              </label>
            </div>
          </Etape>

          {(!evenement || !estClos(evenement)) && (
            <div className='flex justify-center'>
              {!formHasChanges() && (
                <ButtonLink
                  href={redirectTo}
                  style={ButtonStyle.SECONDARY}
                  className='mr-3'
                >
                  Annuler {evenement ? 'la modification' : ''}
                </ButtonLink>
              )}
              {formHasChanges() && (
                <Button
                  type='button'
                  label={`Quitter la ${
                    evenement ? 'modification' : 'création'
                  } de l’événement`}
                  onClick={leaveWithChanges}
                  style={ButtonStyle.SECONDARY}
                  className='mr-3'
                >
                  Annuler {evenement ? ' la modification' : ''}
                </Button>
              )}

              {evenement && (
                <Button
                  type='submit'
                  disabled={!formHasChanges() || !formIsValid()}
                >
                  Modifier l’événement
                </Button>
              )}
              {!evenement && (
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
          )}
        </>
      )}
    </form>
  )
}

function dureeFromMinutes(duration?: number): string | undefined {
  if (!duration) return

  const hours = Math.floor(duration / 60)
  const minutes = duration % 60
  return String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0')
}

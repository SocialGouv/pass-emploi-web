import { DateTime } from 'luxon'
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'

import {
  BeneficiaireIndicationPortefeuille,
  BeneficiaireIndicationPresent,
} from 'components/jeune/BeneficiaireIndications'
import BeneficiairesMultiselectAutocomplete, {
  OptionBeneficiaire,
} from 'components/jeune/BeneficiairesMultiselectAutocomplete'
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
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { ValueWithError } from 'components/ValueWithError'
import { Conseiller } from 'interfaces/conseiller'
import {
  estClos,
  estCreeParSiMILO,
  Evenement,
  TYPE_EVENEMENT,
} from 'interfaces/evenement'
import { BaseJeune, getNomJeuneComplet } from 'interfaces/jeune'
import { EvenementFormData } from 'interfaces/json/evenement'
import { TypeEvenementReferentiel } from 'interfaces/referentiel'
import { modalites } from 'referentiel/evenement'
import {
  DATE_DASH_SEPARATOR,
  dateIsInInterval,
  TIME_24_SIMPLE,
  toFrenchFormat,
  toFrenchString,
} from 'utils/date'

interface EditionRdvFormProps {
  conseiller: Conseiller
  jeunesConseiller: BaseJeune[]
  typesRendezVous: TypeEvenementReferentiel[]
  redirectTo: string
  conseillerIsCreator: boolean
  evenement?: Evenement
  idJeune?: string
  evenementTypeAC?: boolean
  lectureSeule?: boolean
  leaveWithChanges: () => void
  onChanges: (hasChanges: boolean) => void
  soumettreRendezVous: (payload: EvenementFormData) => Promise<void>
  showConfirmationModal: (payload: EvenementFormData) => void
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
  evenementTypeAC,
  lectureSeule,
}: EditionRdvFormProps) {
  const defaultJeunes = initJeunesFromRdvOrIdJeune()
  const [jeunesEtablissement, setJeunesEtablissement] = useState<BaseJeune[]>(
    []
  )
  const [idsJeunes, setIdsJeunes] = useState<ValueWithError<string[]>>({
    value: defaultJeunes.map(({ id }) => id),
  })
  const [codeTypeRendezVous, setCodeTypeRendezVous] = useState<
    string | undefined
  >(evenement?.type.code)

  const [precisionType, setPrecisionType] = useState<
    ValueWithError<string | undefined>
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
  const [date, setDate] = useState<ValueWithError<string | undefined>>({
    value: localDate,
  })
  const regexHoraire = /^([0-1]\d|2[0-3]):[0-5]\d$/
  const localTime = dateRdv && toFrenchString(dateRdv, DateTime.TIME_24_SIMPLE)
  const [horaire, setHoraire] = useState<ValueWithError<string | undefined>>({
    value: localTime,
  })
  const regexDuree = /^\d{2}:\d{2}$/
  const dureeRdv = dureeFromMinutes(evenement?.duree)
  const [duree, setDuree] = useState<ValueWithError<string | undefined>>({
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
  const [titre, setTitre] = useState<ValueWithError<string | undefined>>({
    value: evenement?.titre,
  })
  const [description, setDescription] = useState<
    ValueWithError<string | undefined>
  >({
    value: evenement?.commentaire,
  })

  const [showNombreMaxParticipants, setShowNombreMaxParticipants] =
    useState<boolean>(Boolean(evenement?.nombreMaxParticipants))
  const [nombreMaxParticipants, setNombreMaxParticipants] = useState<
    ValueWithError<number | undefined>
  >({
    value: evenement?.nombreMaxParticipants,
  })
  const nbMaxParticipantsDepasse =
    Boolean(nombreMaxParticipants.value) &&
    idsJeunes.value.length > nombreMaxParticipants.value!

  function estUnBeneficiaireDuConseiller(
    idBeneficiaireAVerifier: string
  ): boolean {
    return jeunesConseiller.some(({ id }) => idBeneficiaireAVerifier === id)
  }

  function buildOptionsJeunes(): OptionBeneficiaire[] {
    if (lectureSeule) return []

    if (!evenementTypeAC) {
      return jeunesConseiller.map((jeune) => ({
        id: jeune.id,
        value: getNomJeuneComplet(jeune),
        avecIndication: false,
      }))
    }

    return jeunesEtablissement.map((jeune) => ({
      id: jeune.id,
      value: getNomJeuneComplet(jeune),
      avecIndication: !estUnBeneficiaireDuConseiller(jeune.id),
    }))
  }

  function initJeunesFromRdvOrIdJeune(): OptionBeneficiaire[] {
    if (evenement && estClos(evenement)) {
      return evenement.jeunes.map((jeune) => ({
        id: jeune.id,
        value: getNomJeuneComplet(jeune),
        avecIndication: jeune.futPresent,
      }))
    }

    if (evenement) {
      return evenement.jeunes.map((jeune) => ({
        id: jeune.id,
        value: getNomJeuneComplet(jeune),
        avecIndication: !estUnBeneficiaireDuConseiller(jeune.id),
      }))
    }

    if (idJeune) {
      const jeune = jeunesConseiller.find(({ id }) => id === idJeune)!
      return [
        {
          id: jeune.id,
          value: getNomJeuneComplet(jeune),
          avecIndication: false,
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
          description.value ||
          nombreMaxParticipants.value
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
      isConseillerPresent !== evenement.presenceConseiller ||
      nombreMaxParticipants.value !== evenement.nombreMaxParticipants
    )
  }

  function formIsValid(): boolean {
    return (
      typeIsValid() &&
      nombreParticipantsIsValid(idsJeunes.value) &&
      dateIsValid() &&
      horaireIsValid() &&
      dureeIsValid() &&
      titreIsValid() &&
      descriptionIsValid() &&
      nombreMaxParticipantsIsValid()
    )
  }

  async function handleSelectedTypeRendezVous(value: string) {
    setNombreMaxParticipants({ value: undefined })
    setCodeTypeRendezVous(value)
    setShowPrecisionType(value === TYPE_EVENEMENT.Autre)
    if (value === TYPE_EVENEMENT.EntretienIndividuelConseiller) {
      setConseillerPresent(true)
    }
  }

  function updateIdsJeunes({ beneficiaires }: { beneficiaires?: string[] }) {
    setIdsJeunes({
      value: beneficiaires!,
      error: validatePresenceParticipants(beneficiaires!),
    })
    onBeneficiairesDUnAutrePortefeuille(
      beneficiaires!.some((id) => !estUnBeneficiaireDuConseiller(id))
    )
  }

  function validateTypeEvenementAutre() {
    if (!precisionType.value) {
      setPrecisionType({
        value: precisionType.value,
        error: `Le champ “Préciser” est vide. Précisez le type ${
          evenementTypeAC ? 'd’animation collective.' : 'de rendez-vous.'
        }`,
      })
    }
  }

  function dateIsValid(): boolean {
    return Boolean(date.value && regexDate.test(date.value))
  }

  function validateDate() {
    const unAnAvant = DateTime.now().minus({ year: 1, day: 1 })
    const deuxAnsApres = DateTime.now().plus({ year: 2 })

    if (
      date.value &&
      !dateIsInInterval(
        DateTime.fromFormat(date.value, 'yyyy-MM-dd'),
        unAnAvant,
        deuxAnsApres
      )
    ) {
      setDate({
        ...date,
        error: `La date est invalide. Le date attendue est comprise entre le ${unAnAvant
          .plus({ day: 1 })
          .toFormat('dd/MM/yyyy')} et le ${deuxAnsApres.toFormat(
          'dd/MM/yyyy'
        )}.`,
      })
    } else if (!dateIsValid()) {
      setDate({
        ...date,
        error:
          'Le champ “Date” est invalide. Le format attendu est jj/mm/aaaa, par exemple : 20/03/2023.',
      })
    }
  }

  function horaireIsValid() {
    return Boolean(horaire.value && regexHoraire.test(horaire.value))
  }

  function validateHoraire() {
    if (!horaireIsValid()) {
      setHoraire({
        ...horaire,
        error:
          'Le champ “Heure” est invalide. Le format attendu est hh:mm, par exemple : 11h10.',
      })
    }
  }

  function dureeIsValid(): boolean {
    return Boolean(duree.value && regexDuree.test(duree.value))
  }

  function validateDuree() {
    if (!dureeIsValid()) {
      setDuree({
        ...duree,
        error:
          'Le champ “Durée” est invalide. Le format attendu est hh:mm, par exemple : 00:30 pour 30 minutes.',
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
    return !evenementTypeAC || Boolean(titre.value)
  }

  function validateTitre() {
    if (evenementTypeAC && !titre.value) {
      setTitre({
        ...titre,
        error: 'Le champ “Titre” est vide. Renseignez un titre.',
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
          'Vous avez dépassé le nombre maximal de caractères. Retirez des caractères.',
      })
    }
  }

  function nombreMaxParticipantsIsValid(): boolean {
    return Boolean(!showNombreMaxParticipants || nombreMaxParticipants.value)
  }

  function validateNombreMaxParticipants() {
    if (!nombreMaxParticipantsIsValid()) {
      setNombreMaxParticipants({
        ...nombreMaxParticipants,
        error:
          'Le champ “Nombre maximum de participants” est vide. Renseignez une valeur, par exemple : 18.',
      })
    }
  }

  function nombreParticipantsIsValid(idsBeneficiaires: string[]): boolean {
    if (
      nombreMaxParticipants.value &&
      nombreMaxParticipants.value < idsBeneficiaires.length
    )
      return false

    return evenementTypeAC || idsBeneficiaires.length > 0
  }

  function validatePresenceParticipants(
    idsBeneficiaires: string[]
  ): string | undefined {
    if (!evenementTypeAC && !idsBeneficiaires.length)
      return "Aucun bénéficiaire n'est renseigné. Sélectionnez au moins un bénéficiaire."
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
      nombreMaxParticipants: nombreMaxParticipants.value,
    }
    if (!conseillerIsCreator && sendEmailInvitation) {
      showConfirmationModal(payload)
    } else {
      await soumettreRendezVous(payload)
    }
  }

  function emailInvitationText() {
    if (conseillerIsCreator) {
      return `Intégrer cet événement à mon agenda via l’adresse e-mail suivante : ${conseiller.email}`
    } else {
      return "Le créateur de l’événement recevra un mail pour l'informer de la modification."
    }
  }

  useEffect(() => {
    if (formHasChanges()) onChanges(true)
    else onChanges(false)
  })

  useEffect(() => {
    if (evenementTypeAC && !lectureSeule) {
      recupererJeunesDeLEtablissement().then(setJeunesEtablissement)
    }
  }, [evenementTypeAC, lectureSeule, recupererJeunesDeLEtablissement])

  function updateNbMaxParticipants(value: string) {
    const parsed = parseInt(value, 10)
    setNombreMaxParticipants({
      value: isNaN(parsed) ? undefined : parsed,
    })
  }

  return (
    <form onSubmit={handleSoumettreRdv}>
      <p className='text-s-bold my-6'>
        Tous les champs avec * sont obligatoires
      </p>

      <Etape
        numero={1}
        titre={`Sélectionnez ${
          evenementTypeAC ? 'une animation collective' : 'un rendez-vous'
        }`}
      >
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
          {Boolean(evenement)
            ? buildOptionTypeDeLevenement(evenement!)
            : buildOptionsTypesReferentiel(typesRendezVous)}
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
      </Etape>

      <Etape
        numero={2}
        titre={`Décrivez ${
          evenementTypeAC ? 'l’animation collective' : 'le rendez-vous'
        }`}
      >
        <Label htmlFor='titre' inputRequired={evenementTypeAC}>
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
          required={evenementTypeAC}
          invalid={Boolean(titre.error)}
          onChange={(value: string) => setTitre({ value })}
          onBlur={validateTitre}
          disabled={lectureSeule}
        />

        <Label htmlFor='description' withBulleMessageSensible={true}>
          {{
            main: 'Commentaire',
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
          maxLength={250}
          onChange={(value: string) => setDescription({ value })}
          invalid={Boolean(description.error)}
          onBlur={validateDescription}
          disabled={lectureSeule}
        />
      </Etape>

      <Etape numero={3} titre='Ajoutez des bénéficiaires'>
        {evenementTypeAC && (
          <>
            <div className='flex items-center mb-8'>
              <label htmlFor='toggle-max-participants' className='mr-4'>
                Définissez un nombre maximum de participants
              </label>
              <Switch
                id='toggle-max-participants'
                checked={showNombreMaxParticipants}
                onChange={() =>
                  setShowNombreMaxParticipants(!showNombreMaxParticipants)
                }
                disabled={lectureSeule}
              />
            </div>

            {showNombreMaxParticipants && (
              <>
                <Label htmlFor='max-participants' inputRequired={true}>
                  Nombre maximum de participants
                </Label>
                {nombreMaxParticipants.error && (
                  <InputError id='max-participants--error' className='mb-2'>
                    {nombreMaxParticipants.error}
                  </InputError>
                )}
                <Input
                  id='max-participants'
                  type='number'
                  defaultValue={nombreMaxParticipants.value}
                  onChange={updateNbMaxParticipants}
                  onBlur={validateNombreMaxParticipants}
                  required={true}
                  min={1}
                  invalid={Boolean(nombreMaxParticipants.error)}
                  disabled={lectureSeule}
                  aria-describedby={
                    Boolean(nombreMaxParticipants.error)
                      ? 'max-participants--error'
                      : nbMaxParticipantsDepasse
                      ? 'nombre-participants--error'
                      : undefined
                  }
                />
              </>
            )}

            {nbMaxParticipantsDepasse && (
              <div id='nombre-participants--error'>
                <FailureAlert label='Le nombre maximum de participants est dépassé.' />
              </div>
            )}
          </>
        )}

        <BeneficiairesMultiselectAutocomplete
          id='select-beneficiaires'
          beneficiaires={buildOptionsJeunes()}
          typeSelection='Bénéficiaires'
          defaultBeneficiaires={defaultJeunes}
          onUpdate={updateIdsJeunes}
          error={idsJeunes.error}
          required={!evenementTypeAC}
          disabled={lectureSeule}
          renderIndication={
            evenement && estClos(evenement)
              ? BeneficiaireIndicationPresent
              : BeneficiaireIndicationPortefeuille
          }
          aria-describedby={
            Boolean(nombreMaxParticipants.error)
              ? 'select-beneficiaires--error'
              : nbMaxParticipantsDepasse
              ? 'nombre-participants--error'
              : undefined
          }
        />
      </Etape>

      <Etape numero={4} titre='Ajoutez les modalités pratiques'>
        <Label htmlFor='modalite'>Modalité</Label>
        <Select
          id='modalite'
          defaultValue={modalite}
          onChange={setModalite}
          disabled={lectureSeule}
        >
          {modalites.map((md) => (
            <option key={md} value={md}>
              {md}
            </option>
          ))}
        </Select>
        <Label htmlFor='date' inputRequired={true}>
          {{
            main: 'Date',
            helpText: 'format : jj/mm/aaaa',
          }}
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
          disabled={lectureSeule}
        />

        <Label htmlFor='horaire' inputRequired={true}>
          {{
            main: 'Heure',
            helpText: 'format : hh:mm',
          }}
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
          disabled={lectureSeule}
        />

        <Label htmlFor='duree' inputRequired={true}>
          {{
            main: 'Durée',
            helpText: 'format : hh:mm',
          }}
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
          disabled={lectureSeule}
        />

        <Label htmlFor='adresse'>
          {{
            main: 'Adresse',
            helpText: 'exemple : 12 rue Duc, Brest',
          }}
        </Label>
        <Input
          type='text'
          id='adresse'
          defaultValue={adresse}
          onChange={setAdresse}
          icon='location'
          disabled={lectureSeule}
        />

        <Label htmlFor='organisme'>
          {{
            main: 'Organisme',
            helpText: 'exemple : prestataire, entreprise, etc.',
          }}
        </Label>
        <Input
          type='text'
          id='organisme'
          defaultValue={organisme}
          onChange={setOrganisme}
          disabled={lectureSeule}
        />
      </Etape>

      <Etape numero={5} titre='Définissez la gestion des accès'>
        {evenement && !conseillerIsCreator && (
          <div className='mb-6'>
            <InformationMessage
              label={
                estCreeParSiMILO(evenement)
                  ? `L'événement a été créé sur i-milo. Vous ne recevrez pas d'invitation dans votre agenda`
                  : `L’événement a été créé par un autre conseiller : ${evenement.createur.prenom} ${evenement.createur.nom}. Vous ne recevrez pas d'invitation dans votre agenda`
              }
            />
          </div>
        )}

        <div className='flex items-center mb-8'>
          <div className='flex items-center'>
            <label htmlFor='presenceConseiller' className='w-64 mr-4'>
              Informer les bénéficiaires qu’un conseiller sera présent à
              l’événement
            </label>
            <Switch
              id='presenceConseiller'
              checked={isConseillerPresent}
              disabled={
                typeEntretienIndividuelConseillerSelected() || lectureSeule
              }
              onChange={handlePresenceConseiller}
            />
          </div>
        </div>

        <div className='flex items-center mb-8'>
          <div className='flex items-center'>
            <label htmlFor='emailInvitation' className='w-64 mr-4'>
              {emailInvitationText()}
            </label>
            <Switch
              id='emailInvitation'
              disabled={Boolean(evenement)}
              checked={sendEmailInvitation}
              onChange={(e) => setSendEmailInvitation(e.target.checked)}
            />
          </div>
        </div>
      </Etape>

      {(!evenement || !lectureSeule) && (
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
              {evenementTypeAC
                ? 'Modifier l’animation collective'
                : 'Modifier le rendez-vous'}
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
              {evenementTypeAC
                ? 'Créer l’animation collective'
                : 'Créer le rendez-vous'}
            </Button>
          )}
        </div>
      )}
    </form>
  )
}

function buildOptionsTypesReferentiel(
  typesRendezVous: TypeEvenementReferentiel[]
) {
  return typesRendezVous.map(({ code, label }) => (
    <option key={code} value={code}>
      {label}
    </option>
  ))
}

function buildOptionTypeDeLevenement(evenement: Evenement) {
  return [
    <option key={evenement.type.code} value={evenement.type.code}>
      {evenement.type.label}
    </option>,
  ]
}

function dureeFromMinutes(duration?: number): string | undefined {
  if (!duration) return

  const hours = Math.floor(duration / 60)
  const minutes = duration % 60
  return String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0')
}

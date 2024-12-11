import { DateTime } from 'luxon'
import React, { FormEvent, useEffect, useRef, useState } from 'react'

import {
  BeneficiaireIndicationPortefeuille,
  BeneficiaireIndicationPresent,
} from 'components/jeune/BeneficiaireIndications'
import BeneficiairesMultiselectAutocomplete, {
  OptionBeneficiaire,
} from 'components/jeune/BeneficiairesMultiselectAutocomplete'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import Etape from 'components/ui/Form/Etape'
import Input from 'components/ui/Form/Input'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import Select from 'components/ui/Form/Select'
import { Switch } from 'components/ui/Form/Switch'
import Textarea from 'components/ui/Form/Textarea'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import RecapitulatifErreursFormulaire, {
  LigneErreur,
} from 'components/ui/Notifications/RecapitulatifErreursFormulaire'
import { ValueWithError } from 'components/ValueWithError'
import {
  BaseBeneficiaire,
  compareParId,
  getNomBeneficiaireComplet,
} from 'interfaces/beneficiaire'
import { Conseiller } from 'interfaces/conseiller'
import {
  estClos,
  estCreeParSiMILO,
  Evenement,
  TYPE_EVENEMENT,
} from 'interfaces/evenement'
import { EvenementFormData } from 'interfaces/json/evenement'
import { TypeEvenementReferentiel } from 'interfaces/referentiel'
import { modalites } from 'referentiel/evenement'
import { trackEvent } from 'utils/analytics/matomo'
import { dateIsInInterval, toShortDate } from 'utils/date'

interface EditionRdvFormProps {
  conseiller: Conseiller
  beneficiairesConseiller: BaseBeneficiaire[]
  typesRendezVous: TypeEvenementReferentiel[]
  redirectTo: string
  conseillerIsCreator: boolean
  evenement?: Evenement
  idBeneficiaire?: string
  evenementTypeAC?: boolean
  lectureSeule?: boolean
  leaveWithChanges: () => void
  onChanges: (hasChanges: boolean) => void
  soumettreRendezVous: (payload: EvenementFormData) => Promise<void>
  showConfirmationModal: (payload: EvenementFormData) => void
  recupererBeneficiairesDeLEtablissement: () => Promise<BaseBeneficiaire[]>
  onBeneficiairesDUnAutrePortefeuille: (b: boolean) => void
}

export function EditionRdvForm({
  beneficiairesConseiller,
  recupererBeneficiairesDeLEtablissement,
  typesRendezVous,
  redirectTo,
  onBeneficiairesDUnAutrePortefeuille,
  conseillerIsCreator,
  conseiller,
  soumettreRendezVous,
  leaveWithChanges,
  onChanges,
  evenement,
  idBeneficiaire,
  showConfirmationModal,
  evenementTypeAC,
  lectureSeule,
}: EditionRdvFormProps) {
  const MAX_INPUT_LENGTH = 250

  const formErrorsRef = useRef<HTMLDivElement>(null)

  const defaultBeneficiaires = initBeneficiairesFromRdvOrIdBeneficiaire()
  const [beneficiairesEtablissement, setBeneficiairesEtablissement] = useState<
    BaseBeneficiaire[]
  >([])
  const [idsJeunes, setIdsJeunes] = useState<ValueWithError<string[]>>({
    value: defaultBeneficiaires.map(({ id }) => id),
  })
  const [codeTypeRendezVous, setCodeTypeRendezVous] = useState<
    ValueWithError<string | undefined>
  >({ value: evenement?.type.code })

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
  const dateRdv = evenement && DateTime.fromISO(evenement.date).toISODate()
  const [date, setDate] = useState<ValueWithError<string | undefined>>({
    value: dateRdv,
  })

  const regexHeure = /^([01]\d|2[0-3]):([0-5]\d)$/
  const timeRdv = evenement && DateTime.fromISO(evenement.date)
  const heureDebut = timeRdv?.toFormat('HH:mm')

  const [heureDeDebut, setHeureDeDebut] = useState<
    ValueWithError<string | undefined>
  >({
    value: heureDebut,
  })

  const heureFin =
    timeRdv && timeRdv.plus({ minutes: evenement.duree }).toFormat('HH:mm')
  const [heureDeFin, setHeureDeFin] = useState<
    ValueWithError<string | undefined>
  >({ value: heureFin })

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

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const lienExport =
    evenement && evenement.id && evenement.statut
      ? `/emargement/${evenement.id}?type=ac`
      : undefined

  function estUnBeneficiaireDuConseiller(
    idBeneficiaireAVerifier: string
  ): boolean {
    return beneficiairesConseiller.some(
      ({ id }) => idBeneficiaireAVerifier === id
    )
  }

  function buildOptionsBeneficiaires(): OptionBeneficiaire[] {
    if (lectureSeule) return []

    if (!evenementTypeAC) {
      return beneficiairesConseiller.map((beneficiaire) => ({
        id: beneficiaire.id,
        value: getNomBeneficiaireComplet(beneficiaire),
        avecIndication: false,
      }))
    }

    return beneficiairesEtablissement.map((beneficiaire) => ({
      id: beneficiaire.id,
      value: getNomBeneficiaireComplet(beneficiaire),
      avecIndication: !estUnBeneficiaireDuConseiller(beneficiaire.id),
    }))
  }

  function initBeneficiairesFromRdvOrIdBeneficiaire(): OptionBeneficiaire[] {
    if (evenement && estClos(evenement)) {
      return evenement.jeunes.map((beneficiaire) => ({
        id: beneficiaire.id,
        value: getNomBeneficiaireComplet(beneficiaire),
        avecIndication: beneficiaire.futPresent,
      }))
    }

    if (evenement) {
      return evenement.jeunes.map((beneficiaire) => ({
        id: beneficiaire.id,
        value: getNomBeneficiaireComplet(beneficiaire),
        avecIndication: !estUnBeneficiaireDuConseiller(beneficiaire.id),
      }))
    }

    if (idBeneficiaire) {
      const beneficiaire = beneficiairesConseiller.find(
        ({ id }) => id === idBeneficiaire
      )!
      return [
        {
          id: beneficiaire.id,
          value: getNomBeneficiaireComplet(beneficiaire),
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
          codeTypeRendezVous.value ||
          modalite ||
          date.value ||
          heureDeDebut.value ||
          heureDeFin.value ||
          titre.value ||
          adresse ||
          organisme ||
          description.value ||
          nombreMaxParticipants.value
      )
    }

    const previousIds = evenement.jeunes.map(({ id }) => id).sort(compareParId)
    const currentIds = [...idsJeunes.value].sort(compareParId)
    return Boolean(
      previousIds.toString() !== currentIds.toString() ||
        modalite !== evenement.modality ||
        date.value !== dateRdv ||
        heureDeDebut.value !== heureDebut ||
        heureDeFin.value !== heureFin ||
        adresse !== evenement.adresse ||
        organisme !== evenement.organisme ||
        titre.value !== evenement.titre ||
        description.value !== evenement.commentaire ||
        isConseillerPresent !== evenement.presenceConseiller ||
        nombreMaxParticipants.value !== evenement.nombreMaxParticipants
    )
  }

  function formIsValid(): boolean {
    const typeEstValide = validateType()
    const titreEstValide = validateTitre()
    const nombreParticipantsEstValide = validateNombreParticipants(
      idsJeunes.value
    )
    const nombreMaxParticipantsEstValide = validateNombreMaxParticipants()
    const dateEstValide = validateDate()
    const horaireEstValide = validateHeureDeDebut()
    const heureDeFinEstValide = validateHeureDeFin()
    const descriptionEstValide = validateDescription()

    return (
      typeEstValide &&
      titreEstValide &&
      nombreParticipantsEstValide &&
      nombreMaxParticipantsEstValide &&
      dateEstValide &&
      horaireEstValide &&
      heureDeFinEstValide &&
      descriptionEstValide
    )
  }

  async function handleSelectedTypeRendezVous(value: string) {
    setNombreMaxParticipants({ value: undefined })
    setCodeTypeRendezVous({ value })
    setShowPrecisionType(value === TYPE_EVENEMENT.Autre)
    if (value !== TYPE_EVENEMENT.Autre && precisionType.error)
      setPrecisionType({ ...precisionType, error: undefined })
    if (value === TYPE_EVENEMENT.EntretienIndividuelConseiller) {
      setConseillerPresent(true)
    }
  }

  function updateIdsBeneficiaires({
    beneficiaires,
  }: {
    beneficiaires?: string[]
  }) {
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

  function validateDate(): boolean {
    const dateEstValide = Boolean(date.value && regexDate.test(date.value))
    if (!dateEstValide) {
      setDate({
        ...date,
        error: 'Le champ “Date“ est vide. Renseignez une date.',
      })
    }
    return dateEstValide
  }

  function validateDateInterval() {
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
        error: `La date est invalide. Le date attendue est comprise entre le ${toShortDate(
          unAnAvant.plus({ day: 1 })
        )} et le ${toShortDate(deuxAnsApres)}.`,
      })
    } else if (!validateDate()) {
      setDate({
        ...date,
        error:
          'Le champ “Date” est invalide. Le format attendu est jj/mm/aaaa, par exemple : 20/03/2023.',
      })
    }
  }

  function validateHeureDeDebut() {
    const horaireEstValide = Boolean(
      heureDeDebut.value && regexHeure.test(heureDeDebut.value)
    )

    if (!heureDeDebut.value) {
      setHeureDeDebut({
        ...heureDeDebut,
        error: 'Le champ “Horaire“ est vide. Renseignez un horaire.',
      })
    } else if (!regexHeure.test(heureDeDebut.value)) {
      setHeureDeDebut({
        ...heureDeDebut,
        error:
          'Le champ “Heure” est invalide. Le format attendu est hh:mm, par exemple : 11h10.',
      })
    }
    return horaireEstValide
  }

  function validateHeureDeFin() {
    const heureDeFinDateTime =
      heureDeFin?.value && DateTime.fromFormat(heureDeFin.value, 'HH:mm')
    const horaireDateTime =
      heureDeDebut?.value && DateTime.fromFormat(heureDeDebut.value, 'HH:mm')

    const heureDefinEstValide = Boolean(
      heureDeFin.value && regexHeure.test(heureDeFin.value)
    )

    if (!heureDeFin.value) {
      setHeureDeFin({
        ...heureDeFin,
        error: 'Le champ “Heure de fin“ est vide. Renseignez une heure de fin.',
      })
    } else if (!regexHeure.test(heureDeFin.value)) {
      setHeureDeFin({
        ...heureDeFin,
        error:
          'Le champ “Heure de fin” est invalide. Le format attendu est hh:mm',
      })
    } else if (
      heureDeFinDateTime &&
      horaireDateTime &&
      heureDeFinDateTime <= horaireDateTime
    ) {
      setHeureDeFin({
        ...heureDeFin,
        error: 'L’heure de fin doit être postérieure à l’heure de début.',
      })
      return false
    } else {
      setHeureDeFin({
        ...heureDeFin,
        error: undefined,
      })
    }

    return heureDefinEstValide
  }

  function validateType(): boolean {
    if (!codeTypeRendezVous.value) {
      setCodeTypeRendezVous({
        ...codeTypeRendezVous,
        error: 'Le champ ”Type” est vide. Renseignez un type.',
      })
      return false
    } else if (
      Boolean(
        codeTypeRendezVous.value === TYPE_EVENEMENT.Autre &&
          !precisionType.value
      )
    ) {
      setPrecisionType({
        ...precisionType,
        error: 'Le champ ”Préciser” est vide. Précisez le type d’évènement.',
      })
      return false
    }
    return true
  }

  function validateTitre(): boolean {
    const titreEstValide = !evenementTypeAC || Boolean(titre.value)
    if (!titreEstValide) {
      setTitre({
        ...titre,
        error: 'Le champ “Titre” est vide. Renseignez un titre.',
      })
    }
    return titreEstValide
  }

  function onBlurTitre() {
    if (evenementTypeAC && !titre.value) {
      setTitre({
        ...titre,
        error: 'Le champ “Titre” est vide. Renseignez un titre.',
      })
    } else {
      setTitre({ value: titre.value })
    }
  }

  function validateDescription() {
    const descriptionEstValide =
      !description.value || description.value.length <= MAX_INPUT_LENGTH

    if (!descriptionEstValide) {
      setDescription({
        ...description,
        error:
          'Vous avez dépassé le nombre maximal de caractères. Retirez des caractères.',
      })
    }
    return descriptionEstValide
  }

  function validateNombreMaxParticipants() {
    const nombreMaxParticipantsIsValid = Boolean(
      !evenementTypeAC ||
        !showNombreMaxParticipants ||
        nombreMaxParticipants.value
    )
    if (!nombreMaxParticipantsIsValid) {
      setNombreMaxParticipants({
        ...nombreMaxParticipants,
        error:
          'Le champ “Nombre maximum de participants” est vide. Renseignez une valeur, par exemple : 18.',
      })
    }
    return nombreMaxParticipantsIsValid
  }

  function validateNombreParticipants(idsBeneficiaires: string[]): boolean {
    if (
      nombreMaxParticipants.value &&
      nombreMaxParticipants.value < idsBeneficiaires.length
    )
      return false

    if (idsBeneficiaires.length === 0 && !evenementTypeAC) {
      setIdsJeunes({
        ...idsJeunes,
        error:
          'Aucun bénéficiaire n’est renseigné. Sélectionnez au moins un bénéficiaire.',
      })

      return false
    }

    return evenementTypeAC || idsBeneficiaires.length > 0
  }

  function validatePresenceParticipants(
    idsBeneficiaires: string[]
  ): string | undefined {
    if (!evenementTypeAC && !idsBeneficiaires.length)
      return "Aucun bénéficiaire n'est renseigné. Sélectionnez au moins un bénéficiaire."
  }

  function typeEntretienIndividuelConseillerSelected() {
    return (
      codeTypeRendezVous.value === TYPE_EVENEMENT.EntretienIndividuelConseiller
    )
  }

  function handlePresenceConseiller() {
    if (typeEntretienIndividuelConseillerSelected()) {
      setConseillerPresent(true)
    } else {
      setConseillerPresent(!isConseillerPresent)
    }
  }

  async function handleSoumettreRdv(e: FormEvent) {
    e.preventDefault()

    if (!formIsValid()) {
      formErrorsRef.current!.focus()
      return
    }
    if (!formHasChanges()) return

    setIsLoading(true)

    const heureDeDebutfromIso = DateTime.fromISO(
      `${date.value}T${heureDeDebut.value}`
    )

    const heureDeFinfromIso = DateTime.fromISO(
      `${date.value}T${heureDeFin.value}`
    )

    const dureeEnMinutes = heureDeFinfromIso.diff(
      heureDeDebutfromIso,
      'minutes'
    ).minutes

    const payload: EvenementFormData = {
      jeunesIds: idsJeunes.value,
      type: codeTypeRendezVous.value!,
      date: heureDeDebutfromIso.toISO(),
      duration: dureeEnMinutes,
      presenceConseiller: isConseillerPresent,
      invitation: sendEmailInvitation,
      precision:
        codeTypeRendezVous.value === TYPE_EVENEMENT.Autre
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

  function getErreurs(): LigneErreur[] {
    const erreurs = []
    if (codeTypeRendezVous.error)
      erreurs.push({
        ancre: '#typeEvenement',
        label: 'Le champ Type est vide.',
        titreChamp: 'Type',
      })
    if (precisionType.error)
      erreurs.push({
        ancre: '#typeEvenement-autre',
        label: 'Le champ Préciser est vide.',
        titreChamp: 'Préciser',
      })
    if (titre.error)
      erreurs.push({
        ancre: '#titre',
        label: 'Le champ Titre est vide.',
        titreChamp: 'Titre',
      })
    if (idsJeunes.error)
      erreurs.push({
        ancre: '#select-beneficiaires',
        label: 'Le champ Bénéficiaires est vide.',
        titreChamp: 'Bénéficiaires',
      })
    if (date.error)
      erreurs.push({
        ancre: '#date',
        label: 'Le champ Date est vide.',
        titreChamp: 'Date',
      })
    if (heureDeDebut.error)
      erreurs.push({
        ancre: '#heure-debut',
        label: 'Le champ Heure de début est vide.',
        titreChamp: 'Horaire',
      })
    if (heureDeFin.error)
      erreurs.push({
        ancre: '#heure-fin',
        label: 'Le champ heure de fin est vide.',
        titreChamp: 'Heure De Fin',
      })
    return erreurs
  }

  function trackExport() {
    trackEvent({
      structure: conseiller.structure,
      categorie: 'Emargement',
      action: 'Export des inscrits à une AC',
      nom: '',
      aDesBeneficiaires: beneficiairesConseiller.length > 0,
    })
  }

  useEffect(() => {
    if (formHasChanges()) onChanges(true)
    else onChanges(false)
  })

  useEffect(() => {
    if (evenementTypeAC && !lectureSeule) {
      recupererBeneficiairesDeLEtablissement().then(
        setBeneficiairesEtablissement
      )
    }
  }, [evenementTypeAC, lectureSeule, recupererBeneficiairesDeLEtablissement])

  function updateNbMaxParticipants(value: string) {
    const parsed = parseInt(value, 10)
    setNombreMaxParticipants({
      value: isNaN(parsed) ? undefined : parsed,
    })
  }

  return (
    <>
      <RecapitulatifErreursFormulaire
        erreurs={getErreurs()}
        ref={formErrorsRef}
      />

      <form onSubmit={handleSoumettreRdv} noValidate={true}>
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
          {codeTypeRendezVous.error && (
            <InputError id='typeEvenement--error' className='mb-2'>
              {codeTypeRendezVous.error}
            </InputError>
          )}
          <Select
            id='typeEvenement'
            defaultValue={codeTypeRendezVous.value}
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
            onBlur={onBlurTitre}
            disabled={lectureSeule}
          />

          <Label htmlFor='description' withBulleMessageSensible={true}>
            {{
              main: 'Description',
              helpText: `${MAX_INPUT_LENGTH} caractères maximum`,
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
            maxLength={MAX_INPUT_LENGTH}
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
            beneficiaires={buildOptionsBeneficiaires()}
            typeSelection='Bénéficiaires'
            defaultBeneficiaires={defaultBeneficiaires}
            onUpdate={updateIdsBeneficiaires}
            error={idsJeunes.error}
            required={!evenementTypeAC}
            disabled={lectureSeule}
            Indication={
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
            trackExport={trackExport}
            lienExport={lienExport}
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
            onBlur={validateDateInterval}
            invalid={Boolean(date.error)}
            disabled={lectureSeule}
          />

          <Label htmlFor='heure-debut' inputRequired={true}>
            {{
              main: 'Heure de début',
              helpText: 'format : hh:mm',
            }}
          </Label>
          {heureDeDebut.error && (
            <InputError id='heure-debut--error' className='mb-2'>
              {heureDeDebut.error}
            </InputError>
          )}
          <Input
            type='time'
            id='heure-debut'
            defaultValue={heureDeDebut.value}
            required={true}
            onChange={(value: string) => setHeureDeDebut({ value })}
            onBlur={validateHeureDeDebut}
            invalid={Boolean(heureDeDebut.error)}
            disabled={lectureSeule}
          />

          <Label htmlFor='heure-fin' inputRequired={true}>
            {{
              main: 'Heure de fin',
              helpText: 'format : hh:mm',
            }}
          </Label>
          {heureDeFin.error && (
            <InputError id='heure-fin--error' className='mb-2'>
              {heureDeFin.error}
            </InputError>
          )}
          <Input
            type='time'
            id='heure-fin'
            required={true}
            defaultValue={heureDeFin.value}
            onChange={(value: string) => setHeureDeFin({ value })}
            onBlur={validateHeureDeFin}
            invalid={Boolean(heureDeFin.error)}
            disabled={lectureSeule}
          />

          <Label htmlFor='adresse'>
            {{
              main: 'Adresse',
              helpText: 'exemple : 12 rue Duc, Brest',
            }}
          </Label>
          <div className='relative'>
            <Input
              type='text'
              id='adresse'
              defaultValue={adresse}
              onChange={setAdresse}
              disabled={lectureSeule}
            />
            <IconComponent
              name={IconName.LocationOn}
              className='w-5 h-5 fill-accent absolute top-1/3 right-5 -translate-y-1/2 fill-accent'
              focusable={false}
              aria-hidden={true}
            />
          </div>

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
                onChange={() => setSendEmailInvitation(!sendEmailInvitation)}
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
                label={`Annuler et quitter la ${
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
              <Button type='submit'>
                {evenementTypeAC
                  ? 'Modifier l’animation collective'
                  : 'Modifier le rendez-vous'}
              </Button>
            )}
            {!evenement && (
              <Button type='submit' isLoading={isLoading}>
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
    </>
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

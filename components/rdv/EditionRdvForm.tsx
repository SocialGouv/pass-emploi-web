import { ChangeEvent, FormEvent, useEffect, useState } from 'react'

import JeunesMultiselectAutocomplete, {
  jeuneToOption,
  OptionJeune,
} from 'components/jeune/JeunesMultiselectAutocomplete'
import { RequiredValue } from 'components/RequiredValue'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import Input from 'components/ui/Form/Input'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import Select from 'components/ui/Form/Select'
import { Switch } from 'components/ui/Form/Switch'
import Textarea from 'components/ui/Form/Textarea'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { BaseJeune } from 'interfaces/jeune'
import { RdvFormData } from 'interfaces/json/rdv'
import { Rdv, TYPE_RENDEZ_VOUS, TypeRendezVous } from 'interfaces/rdv'
import { modalites } from 'referentiel/rdv'
import { toIsoLocalDate, toIsoLocalTime } from 'utils/date'

interface EditionRdvFormProps {
  jeunes: BaseJeune[]
  typesRendezVous: TypeRendezVous[]
  redirectTo: string
  aDesJeunesDUnAutrePortefeuille: boolean
  conseillerIsCreator: boolean
  conseillerEmail: string
  soumettreRendezVous: (payload: RdvFormData) => Promise<void>
  leaveWithChanges: () => void
  onChanges: (hasChanges: boolean) => void
  rdv?: Rdv
  idJeune?: string
  showConfirmationModal: (payload: RdvFormData) => void
}

export function EditionRdvForm({
  jeunes,
  typesRendezVous,
  redirectTo,
  aDesJeunesDUnAutrePortefeuille,
  conseillerIsCreator,
  conseillerEmail,
  soumettreRendezVous,
  leaveWithChanges,
  onChanges,
  rdv,
  idJeune,
  showConfirmationModal,
}: EditionRdvFormProps) {
  const defaultJeunes = initJeunesFromRdvOrIdJeune()
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
  const dateRdv = rdv ? new Date(rdv.date) : undefined
  const localDate = toIsoLocalDate(dateRdv) ?? ''
  const [date, setDate] = useState<RequiredValue>({ value: localDate })
  const regexHoraire = /^([0-1]\d|2[0-3]):[0-5]\d$/
  const localTime = toIsoLocalTime(dateRdv)?.slice(0, 5) ?? ''
  const [horaire, setHoraire] = useState<RequiredValue>({ value: localTime })
  const regexDuree = /^\d{2}:\d{2}$/
  const dureeRdv = dureeFromMinutes(rdv?.duration)
  const [duree, setDuree] = useState<RequiredValue>({ value: dureeRdv })
  const [adresse, setAdresse] = useState<string>(rdv?.adresse ?? '')
  const [organisme, setOrganisme] = useState<string>(rdv?.organisme ?? '')
  const [isConseillerPresent, setConseillerPresent] = useState<boolean>(
    rdv?.presenceConseiller ?? true
  )
  const [sendEmailInvitation, setSendEmailInvitation] = useState<boolean>(
    Boolean(rdv?.invitation)
  )
  const [commentaire, setCommentaire] = useState<string>(rdv?.comment ?? '')

  function formHasChanges(): boolean {
    if (!rdv) {
      return Boolean(
        idsJeunes.value.length ||
          codeTypeRendezVous ||
          modalite ||
          date.value ||
          horaire.value ||
          duree.value ||
          adresse ||
          organisme ||
          commentaire
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
      commentaire !== rdv.comment ||
      isConseillerPresent !== rdv.presenceConseiller
    )
  }

  function formIsValid(): boolean {
    return (
      Boolean(idsJeunes.value.length) &&
      dateIsValid() &&
      horaireIsValid() &&
      dureeIsValid() &&
      typeIsValid()
    )
  }

  function handleSelectedTypeRendezVous(value: string) {
    setCodeTypeRendezVous(value)
    setShowPrecisionType(value === TYPE_RENDEZ_VOUS.Autre)
    if (value === TYPE_RENDEZ_VOUS.EntretienIndividuelConseiller) {
      setConseillerPresent(true)
    }
  }

  function updateIdsJeunes(selectedIds: string[]) {
    setIdsJeunes({
      value: selectedIds,
      error: !selectedIds.length
        ? "Aucun bénéficiaire n'est renseigné. Veuillez sélectionner au moins un bénéficiaire."
        : undefined,
    })
  }

  function validateTypeRendezVousAutre() {
    if (!precisionType.value) {
      setPrecisionType({
        value: precisionType.value,
        error:
          "Le champ Préciser n'est pas renseigné. Veuillez préciser le type de rendez-vous.",
      })
    }
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
    if (codeTypeRendezVous === TYPE_RENDEZ_VOUS.Autre)
      return Boolean(precisionType.value)
    return true
  }

  function typeEntretienIndividuelConseillerSelected() {
    return codeTypeRendezVous === TYPE_RENDEZ_VOUS.EntretienIndividuelConseiller
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
    const payload: RdvFormData = {
      jeunesIds: idsJeunes.value,
      type: codeTypeRendezVous,
      date: new Date(`${date.value} ${horaire.value}`).toISOString(),
      duration: parseInt(dureeHeures, 10) * 60 + parseInt(dureeMinutes, 10),
      presenceConseiller: isConseillerPresent,
      invitation: sendEmailInvitation,
      precision:
        codeTypeRendezVous === TYPE_RENDEZ_VOUS.Autre
          ? precisionType.value
          : undefined,
      modality: modalite || undefined,
      adresse: adresse || undefined,
      organisme: organisme || undefined,
      comment: commentaire || undefined,
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

  function emailInvitationText(conseillerIsCreator: boolean) {
    if (conseillerIsCreator) {
      return `Intégrer ce rendez-vous à mon agenda via l’adresse e-mail suivante :
      ${conseillerEmail}`
    } else {
      return "Le créateur du rendez-vous recevra un mail pour l'informer de la modification."
    }
  }

  return (
    <form onSubmit={handleSoumettreRdv}>
      <p className='text-s-bold mb-6'>
        Tous les champs avec * sont obligatoires
      </p>

      {aDesJeunesDUnAutrePortefeuille && (
        <div className='mb-6'>
          <InformationMessage content='Ce rendez-vous concerne des jeunes que vous ne suivez pas et qui ne sont pas dans votre portefeuille' />
        </div>
      )}

      <fieldset className='border-none flex flex-col mb-8'>
        <legend className='flex items-center text-m-bold mb-4'>
          <IconComponent
            name={IconName.Chiffre1}
            role='img'
            focusable='false'
            aria-label='Étape 1'
            className='mr-2 w-8 h-8'
          />
          Bénéficiaires :
        </legend>

        <JeunesMultiselectAutocomplete
          jeunes={jeunes}
          typeSelection='Bénéficiaires'
          defaultJeunes={defaultJeunes}
          onUpdate={updateIdsJeunes}
          error={idsJeunes.error}
        />
      </fieldset>

      <fieldset className='border-none flex flex-col'>
        <legend className='flex items-center text-m-bold mb-4'>
          <IconComponent
            name={IconName.Chiffre2}
            role='img'
            focusable='false'
            aria-label='Étape 2'
            className='mr-2 w-8 h-8'
          />
          Type de rendez-vous :
        </legend>

        <Label htmlFor='typeRendezVous' inputRequired={true}>
          Type
        </Label>
        <Select
          id='typeRendezVous'
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
              htmlFor='typeRendezVous-autre'
              inputRequired={true}
              withBulleMessageSensible={true}
            >
              Préciser
            </Label>
            {precisionType.error && (
              <InputError id='typeRendezVous-autre--error' className='mb-2'>
                {precisionType.error}
              </InputError>
            )}
            <Input
              type='text'
              id='typeRendezVous-autre'
              required={true}
              disabled={Boolean(rdv)}
              defaultValue={precisionType.value}
              onChange={(value: string) => setPrecisionType({ value })}
              onBlur={validateTypeRendezVousAutre}
              invalid={Boolean(precisionType.error)}
            />
          </>
        )}

        <Label htmlFor='modalite'>Modalité</Label>
        <Select id='modalite' defaultValue={modalite} onChange={setModalite}>
          {modalites.map((md) => (
            <option key={md} value={md}>
              {md}
            </option>
          ))}
        </Select>
      </fieldset>

      <fieldset className='border-none flex flex-col'>
        <legend className='flex items-center text-m-bold mb-4'>
          <IconComponent
            name={IconName.Chiffre3}
            role='img'
            focusable='false'
            aria-label='Étape 3'
            className='mr-2 w-8 h-8'
          />
          Lieu et date :
        </legend>

        <Label htmlFor='date' inputRequired={true}>
          Date
          <span className='text-base-regular'> (format : jj/mm/aaaa)</span>
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
          Heure
          <span className='text-base-regular'> (format : hh:mm)</span>
        </Label>
        {horaire.error && (
          <InputError id='horaire--error' className='mb-2'>
            {horaire.error}
          </InputError>
        )}
        <Input
          type='text'
          id='horaire'
          defaultValue={horaire.value}
          required={true}
          onChange={(value: string) => setHoraire({ value })}
          onBlur={validateHoraire}
          invalid={Boolean(horaire.error)}
          aria-invalid={horaire.error ? true : undefined}
          aria-describedby={horaire.error ? 'horaire--error' : undefined}
          icon='clock'
        />

        <Label htmlFor='duree' inputRequired={true}>
          Durée
          <span className='text-base-regular'> (format : hh:mm)</span>
        </Label>
        {duree.error && (
          <InputError id='duree--error' className='mb-2'>
            {duree.error}
          </InputError>
        )}
        <Input
          type='text'
          id='duree'
          required={true}
          defaultValue={duree.value}
          onChange={(value: string) => setDuree({ value })}
          onBlur={validateDuree}
          invalid={Boolean(duree.error)}
        />

        <Label htmlFor='adresse'>
          Adresse
          <span className='text-base-regular'> Ex: 12 rue duc, Brest</span>
        </Label>
        <Input
          type='text'
          id='adresse'
          defaultValue={adresse}
          onChange={setAdresse}
          icon='location'
        />

        <Label htmlFor='organisme'>
          Organisme
          <span className='text-base-regular'>
            {' '}
            Ex: prestataire, entreprise, etc.
          </span>
        </Label>
        <Input
          type='text'
          id='organisme'
          defaultValue={organisme}
          onChange={setOrganisme}
        />
      </fieldset>

      <fieldset className='border-none flex flex-col'>
        <legend className='flex items-center text-m-bold mb-4'>
          <IconComponent
            name={IconName.Chiffre4}
            role='img'
            focusable='false'
            aria-label='Étape 4'
            className='mr-2 w-8 h-8'
          />
          Informations conseiller :
        </legend>

        {!conseillerIsCreator && (
          <>
            {rdv!.createur && (
              <div className='mb-6'>
                <InformationMessage
                  content={`Le rendez-vous a été créé par un autre conseiller : ${
                    rdv!.createur.prenom
                  } ${
                    rdv!.createur.nom
                  }. Vous ne recevrez pas d'invitation dans votre agenda`}
                />
              </div>
            )}
            {!rdv!.createur && (
              <div className='mb-6'>
                <InformationMessage
                  content={`Le rendez-vous a été créé par un autre conseiller. Vous ne recevrez pas d'invitation dans votre agenda`}
                />
              </div>
            )}
          </>
        )}

        <div className='flex items-center mb-8'>
          <label htmlFor='presenceConseiller' className='flex items-center'>
            <span className='w-64 mr-4'>
              Informer les bénéficiaires qu’un conseiller sera présent au
              rendez-vous
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

        <Label htmlFor='commentaire' withBulleMessageSensible={true}>
          <span className='flex items-center'>
            Commentaire à destination des jeunes
          </span>
          <span className='block text-s-regular'>
            Le commentaire sera lu par l’ensemble des destinataires.
          </span>
        </Label>
        <Textarea
          id='commentaire'
          defaultValue={commentaire}
          rows={3}
          onChange={(e) => setCommentaire(e.target.value)}
        />
      </fieldset>

      <div className='flex justify-center'>
        {!formHasChanges() && (
          <ButtonLink
            href={redirectTo}
            style={ButtonStyle.SECONDARY}
            className='mr-3'
          >
            Annuler
          </ButtonLink>
        )}
        {formHasChanges() && (
          <Button
            type='button'
            label={`Quitter la ${
              rdv ? 'modification' : 'création'
            } du rendez-vous`}
            onClick={leaveWithChanges}
            style={ButtonStyle.SECONDARY}
            className='mr-3'
          >
            Annuler
          </Button>
        )}

        <Button type='submit' disabled={!formHasChanges() || !formIsValid()}>
          Envoyer
        </Button>
      </div>
    </form>
  )

  function initJeunesFromRdvOrIdJeune(): OptionJeune[] {
    if (rdv) {
      return rdv.jeunes.map(({ id, nom, prenom }) => ({
        id,
        value: nom + ' ' + prenom,
      }))
    }
    if (idJeune) {
      const jeune = jeunes.find(({ id }) => id === idJeune)!
      return [jeuneToOption(jeune)]
    }
    return []
  }
}

function dureeFromMinutes(duration?: number): string {
  if (!duration) return ''

  const hours = Math.floor(duration / 60)
  const minutes = duration % 60
  return String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0')
}

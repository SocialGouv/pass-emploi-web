import { ChangeEvent, FormEvent, useEffect, useState } from 'react'

import InformationMessage from 'components/InformationMessage'
import JeunesMultiselectAutocomplete, {
  jeuneToOption,
  OptionJeune,
} from 'components/jeune/JeunesMultiselectAutocomplete'
import { RequiredValue } from 'components/RequiredValue'
import BulleMessageSensible from 'components/ui/BulleMessageSensible'
import Button, { ButtonStyle } from 'components/ui/Button'
import ButtonLink from 'components/ui/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { InputError } from 'components/ui/InputError'
import { Switch } from 'components/ui/Switch'
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

  function handleSelectedTypeRendezVous(e: ChangeEvent<HTMLSelectElement>) {
    setCodeTypeRendezVous(e.target.value)
    setShowPrecisionType(e.target.value === TYPE_RENDEZ_VOUS.Autre)
    if (e.target.value === TYPE_RENDEZ_VOUS.EntretienIndividuelConseiller) {
      setConseillerPresent(true)
    }
  }

  function updateIdsJeunes(selectedIds: string[]) {
    setIdsJeunes({
      value: selectedIds,
      error: !selectedIds.length
        ? "Aucun b??n??ficiaire n'est renseign??. Veuillez s??lectionner au moins un b??n??ficiaire."
        : undefined,
    })
  }

  function validateTypeRendezVousAutre() {
    if (!precisionType.value) {
      setPrecisionType({
        value: precisionType.value,
        error:
          "Le champ Pr??ciser n'est pas renseign??. Veuillez pr??ciser le type de rendez-vous.",
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
          "Le champ heure n'est pas renseign??. Veuillez renseigner une heure.",
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
          "Le champ dur??e n'est pas renseign??. Veuillez renseigner une dur??e.",
      })
    } else if (!dureeIsValid()) {
      setDuree({
        ...duree,
        error:
          "Le champ dur??e n'est pas valide. Veuillez respecter le format hh:mm",
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
      return `Int??grer ce rendez-vous ?? mon agenda via l???adresse e-mail suivante :
      ${conseillerEmail}`
    } else {
      return "Le cr??ateur du rendez-vous recevra un mail pour l'informer de la modification."
    }
  }

  return (
    <form onSubmit={handleSoumettreRdv}>
      <p className='text-s-medium mb-6'>
        Tous les champs avec * sont obligatoires
      </p>

      {aDesJeunesDUnAutrePortefeuille && (
        <div className='mb-6'>
          <InformationMessage content='Ce rendez-vous concerne des jeunes que vous ne suivez pas et qui ne sont pas dans votre portefeuille' />
        </div>
      )}

      <fieldset className='border-none flex flex-col mb-8'>
        <legend className='flex items-center text-m-medium mb-4'>
          <IconComponent
            name={IconName.Chiffre1}
            role='img'
            focusable='false'
            aria-label='??tape 1'
            className='mr-2 w-8 h-8'
          />
          B??n??ficiaires :
        </legend>

        <JeunesMultiselectAutocomplete
          jeunes={jeunes}
          typeSelection='B??n??ficiaires'
          defaultJeunes={defaultJeunes}
          onUpdate={updateIdsJeunes}
          error={idsJeunes.error}
        />
      </fieldset>

      <fieldset className='border-none flex flex-col'>
        <legend className='flex items-center text-m-medium mb-4'>
          <IconComponent
            name={IconName.Chiffre2}
            role='img'
            focusable='false'
            aria-label='??tape 2'
            className='mr-2 w-8 h-8'
          />
          Type de rendez-vous :
        </legend>

        <label htmlFor='typeRendezVous' className='text-base-medium mb-2'>
          <span aria-hidden={true}>* </span>Type
        </label>
        <select
          id='typeRendezVous'
          name='typeRendezVous'
          defaultValue={codeTypeRendezVous}
          required={true}
          disabled={Boolean(rdv)}
          onChange={handleSelectedTypeRendezVous}
          className={`border border-solid border-content_color rounded-medium w-full px-4 py-3 mb-8 disabled:bg-grey_100`}
        >
          <option aria-hidden hidden disabled value={''} />
          {typesRendezVous.map(({ code, label }) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>

        {showPrecisionType && (
          <>
            <label
              htmlFor='typeRendezVous-autre'
              className='flex text-base-medium mb-2 items-center'
            >
              <span aria-hidden={true}>* </span>Pr??ciser
              <span className='ml-2'>
                <BulleMessageSensible />
              </span>
            </label>
            {precisionType.error && (
              <InputError id='typeRendezVous-autre--error' className='mb-2'>
                {precisionType.error}
              </InputError>
            )}
            <input
              type='text'
              id='typeRendezVous-autre'
              name='typeRendezVous-autre'
              required={true}
              disabled={Boolean(rdv)}
              defaultValue={precisionType.value}
              onChange={(e) => setPrecisionType({ value: e.target.value })}
              onBlur={validateTypeRendezVousAutre}
              aria-invalid={precisionType.error ? true : undefined}
              aria-describedby={
                precisionType.error ? 'typeRendezVous-autre--error' : undefined
              }
              className={`border border-solid rounded-medium w-full px-4 py-3 mb-4 disabled:bg-grey_100 ${
                precisionType.error
                  ? 'border-warning text-warning'
                  : 'border-content_color'
              }`}
            />
          </>
        )}

        <label htmlFor='modalite' className='text-base-medium mb-2'>
          Modalit??
        </label>
        <select
          id='modalite'
          name='modalite'
          defaultValue={modalite}
          onChange={(e) => setModalite(e.target.value)}
          className={`border border-solid border-content_color rounded-medium w-full px-4 py-3 mb-8`}
        >
          <option aria-hidden hidden disabled value={''} />
          {modalites.map((md) => (
            <option key={md} value={md}>
              {md}
            </option>
          ))}
        </select>
      </fieldset>

      <fieldset className='border-none flex flex-col'>
        <legend className='flex items-center text-m-medium mb-4'>
          <IconComponent
            name={IconName.Chiffre3}
            role='img'
            focusable='false'
            aria-label='??tape 3'
            className='mr-2 w-8 h-8'
          />
          Lieu et date :
        </legend>

        <label htmlFor='date' className='text-base-medium mb-2'>
          <span aria-hidden={true}>* </span>Date
          <span className='text-s-regular'> (format : jj/mm/aaaa)</span>
        </label>
        {date.error && (
          <InputError id='date-error' className='mb-2'>
            {date.error}
          </InputError>
        )}
        <input
          type='date'
          id='date'
          name='date'
          defaultValue={date.value}
          required={true}
          onChange={(e) => setDate({ value: e.target.value })}
          onBlur={validateDate}
          aria-invalid={date.error ? true : undefined}
          aria-describedby={date.error ? 'date-error' : undefined}
          className={`border border-solid rounded-medium w-full px-4 py-3 mb-4 ${
            date.error ? 'border-warning text-warning' : 'border-content_color'
          }`}
        />

        <label htmlFor='horaire' className='text-base-medium mb-2'>
          <span aria-hidden='true'>* </span>Heure
          <span className='text-s-regular'> (format : hh:mm)</span>
        </label>
        {horaire.error && (
          <InputError id='horaire-error' className='mb-2'>
            {horaire.error}
          </InputError>
        )}
        <input
          type='text'
          id='horaire'
          name='horaire'
          defaultValue={horaire.value}
          required={true}
          onChange={(e) => setHoraire({ value: e.target.value })}
          onBlur={validateHoraire}
          aria-invalid={horaire.error ? true : undefined}
          aria-describedby={horaire.error ? 'horaire-error' : undefined}
          className={`border border-solid rounded-medium w-full px-4 py-3 mb-4 ${
            horaire.error
              ? 'border-warning text-warning'
              : 'border-content_color'
          } bg-clock bg-[center_right_1rem] bg-no-repeat`}
        />

        <label htmlFor='duree' className='text-base-medium mb-2'>
          <span aria-hidden='true'>* </span>Dur??e
          <span className='text-s-regular'> (format : hh:mm)</span>
        </label>
        {duree.error && (
          <InputError id='duree-error' className='mb-2'>
            {duree.error}
          </InputError>
        )}
        <input
          type='text'
          id='duree'
          name='duree'
          required={true}
          defaultValue={duree.value}
          onChange={(e) => setDuree({ value: e.target.value })}
          onBlur={validateDuree}
          aria-invalid={duree.error ? true : undefined}
          aria-describedby={duree.error ? 'duree-error' : undefined}
          className={`border border-solid rounded-medium w-full px-4 py-3 mb-8 ${
            duree.error ? 'border-warning text-warning' : 'border-content_color'
          }`}
        />

        <label htmlFor='adresse' className='text-base-medium mb-2'>
          Adresse
          <span className='text-s-regular'> Ex: 12 rue duc, Brest</span>
        </label>
        <input
          type='text'
          id='adresse'
          name='adresse'
          defaultValue={adresse}
          onChange={(e) => setAdresse(e.target.value)}
          className={
            'border border-solid rounded-medium w-full px-4 py-3 mb-8 bg-location bg-[center_right_1rem] bg-no-repeat'
          }
        />

        <label htmlFor='organisme' className='text-base-medium mb-2'>
          Organisme
          <span className='text-s-regular'>
            {' '}
            Ex: prestataire, entreprise, etc.
          </span>
        </label>
        <input
          type='text'
          id='organisme'
          name='organisme'
          defaultValue={organisme}
          onChange={(e) => setOrganisme(e.target.value)}
          className={'border border-solid rounded-medium w-full px-4 py-3 mb-8'}
        />
      </fieldset>

      <fieldset className='border-none flex flex-col'>
        <legend className='flex items-center text-m-medium mb-4'>
          <IconComponent
            name={IconName.Chiffre4}
            role='img'
            focusable='false'
            aria-label='??tape 4'
            className='mr-2 w-8 h-8'
          />
          Informations conseiller :
        </legend>

        {!conseillerIsCreator && (
          <>
            {rdv!.createur && (
              <div className='mb-6'>
                <InformationMessage
                  content={`Le rendez-vous a ??t?? cr???? par un autre conseiller : ${
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
                  content={`Le rendez-vous a ??t?? cr???? par un autre conseiller. Vous ne recevrez pas d'invitation dans votre agenda`}
                />
              </div>
            )}
          </>
        )}

        <div className='flex items-center mb-8'>
          <label htmlFor='presenceConseiller' className='flex items-center'>
            <span className='w-64 mr-4'>
              Informer les b??n??ficiaires qu???un conseiller sera pr??sent au
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

        <label htmlFor='commentaire' className='text-base-regular mb-2'>
          <span className='flex items-center'>
            Notes
            <span className='ml-2'>
              <BulleMessageSensible />
            </span>
          </span>
          <span className='block text-s-regular'>
            Commentaire ?? destination des jeunes
          </span>
        </label>
        <textarea
          id='commentaire'
          name='commentaire'
          defaultValue={commentaire}
          rows={3}
          onChange={(e) => setCommentaire(e.target.value)}
          className='border border-solid border-content_color rounded-medium w-full px-4 py-3 mb-8'
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
              rdv ? 'modification' : 'cr??ation'
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

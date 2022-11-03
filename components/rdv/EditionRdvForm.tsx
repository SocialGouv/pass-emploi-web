import { DateTime } from 'luxon'
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'

import JeunesMultiselectAutocomplete, {
  jeuneToOption,
  OptionJeune,
} from 'components/jeune/JeunesMultiselectAutocomplete'
import { RequiredValue } from 'components/RequiredValue'
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
import { BaseJeune } from 'interfaces/jeune'
import { RdvFormData } from 'interfaces/json/rdv'
import {
  isCodeTypeAnimationCollective,
  Rdv,
  TYPE_RENDEZ_VOUS,
  TypeRendezVous,
} from 'interfaces/rdv'
import { modalites } from 'referentiel/rdv'
import {
  DATE_DASH_SEPARATOR,
  TIME_24_SIMPLE,
  toFrenchFormat,
  toFrenchString,
} from 'utils/date'

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
  conseillerAgence?: string
  rdv?: Rdv
  idJeune?: string
  showConfirmationModal: (payload: RdvFormData) => void
  renseignerAgence: () => void
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
  conseillerAgence,
  rdv,
  idJeune,
  showConfirmationModal,
  renseignerAgence,
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
  const dateRdv = rdv ? DateTime.fromISO(rdv.date) : undefined
  const localDate = dateRdv ? toFrenchFormat(dateRdv, DATE_DASH_SEPARATOR) : ''
  const [date, setDate] = useState<RequiredValue>({ value: localDate })
  const regexHoraire = /^([0-1]\d|2[0-3]):[0-5]\d$/
  const localTime = dateRdv
    ? toFrenchString(dateRdv, DateTime.TIME_24_SIMPLE)
    : ''
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

  const isAgenceNecessaire =
    isCodeTypeAnimationCollective(codeTypeRendezVous) && !conseillerAgence
  const afficherSuiteFormulaire =
    codeTypeRendezVous &&
    (!isCodeTypeAnimationCollective(codeTypeRendezVous) || conseillerAgence)

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

  function validateTypeEvenementAutre() {
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
    const dateTime: DateTime = DateTime.fromFormat(
      `${date.value} ${horaire.value}`,
      `${DATE_DASH_SEPARATOR} ${TIME_24_SIMPLE}`
    )
    const payload: RdvFormData = {
      jeunesIds: idsJeunes.value,
      type: codeTypeRendezVous,
      date: dateTime.toISO(),
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
          <div>
            <p>Votre Mission locale n’est pas renseignée</p>
            <p>
              Pour créer une information collective ou un atelier vous devez
              renseigner votre Mission locale dans votre profil.
            </p>
            <Button
              type='button'
              style={ButtonStyle.PRIMARY}
              onClick={renseignerAgence}
            >
              Renseigner votre Mission locale
            </Button>
          </div>
        )}
      </Etape>

      {afficherSuiteFormulaire && (
        <>
          <Etape numero={2} titre='Bénéficiaires'>
            <JeunesMultiselectAutocomplete
              jeunes={jeunes}
              typeSelection='Bénéficiaires'
              defaultJeunes={defaultJeunes}
              onUpdate={updateIdsJeunes}
              error={idsJeunes.error}
            />
          </Etape>
          <Etape numero={3} titre='Lieu et date'>
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

          <Etape numero={4} titre='Informations conseiller'>
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
              {{
                main: 'Commentaire à destination des jeunes',
                helpText:
                  'Le commentaire sera lu par l’ensemble des destinataires',
              }}
            </Label>
            <Textarea
              id='commentaire'
              defaultValue={commentaire}
              rows={3}
              onChange={(e) => setCommentaire(e.target.value)}
            />
          </Etape>

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

            {rdv && (
              <Button
                type='submit'
                disabled={!formHasChanges() || !formIsValid()}
              >
                Modifier le rendez-vous
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
                Créer le rendez-vous
              </Button>
            )}
          </div>
        </>
      )}
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

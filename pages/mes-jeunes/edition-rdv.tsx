import { AppHead } from 'components/AppHead'
import ExitPageConfirmationModal from 'components/ExitPageConfirmationModal'
import Button, { ButtonStyle } from 'components/ui/Button'
import ButtonLink from 'components/ui/ButtonLink'
import { InputError } from 'components/ui/InputError'
import { Jeune } from 'interfaces/jeune'
import { GetServerSideProps } from 'next'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ChangeEvent, FormEvent, MouseEvent, useState } from 'react'
import { modalites } from 'referentiel/rdv'
import { JeunesService } from 'services/jeunes.service'
import { RendezVousService } from 'services/rendez-vous.service'
import styles from 'styles/components/Layouts.module.css'
import useMatomo from 'utils/analytics/useMatomo'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import BackIcon from '../../assets/icons/arrow_back.svg'
import Etape1Icon from '../../assets/icons/etape_1.svg'
import Etape2Icon from '../../assets/icons/etape_2.svg'
import Etape3Icon from '../../assets/icons/etape_3.svg'
import Etape4Icon from '../../assets/icons/etape_4.svg'
import { TYPE_RENDEZ_VOUS, TypeRendezVous } from 'interfaces/rdv'
import { Switch } from 'components/ui/Switch'

interface EditionRdvProps {
  emailConseiller: string
  jeunes: Jeune[]
  typesRendezVous: TypeRendezVous[]
  from: string
  withoutChat: true
  idJeuneFrom?: string
}

interface InputValue {
  value: string
  error?: string
}

function EditionRdv({
  emailConseiller,
  jeunes,
  typesRendezVous,
  idJeuneFrom,
  from,
}: EditionRdvProps) {
  const { data: session } = useSession({ required: true })
  const rendezVousService =
    useDependance<RendezVousService>('rendezVousService')
  const router = useRouter()

  const [jeuneId, setJeuneId] = useState<string>(idJeuneFrom ?? '')

  const [codeTypeRendezVous, setCodeTypeRendezVous] = useState<InputValue>({
    value: '',
  })
  const [precisionType, setPrecisionType] = useState<InputValue>({
    value: '',
  })
  const [showPrecisionType, setShowPrecisionType] = useState<boolean>(false)
  const [modalite, setModalite] = useState<string>('')
  const regexDate = /^\d{4}-(0\d|1[0-2])-([0-2]\d|3[01])$/
  const [date, setDate] = useState<InputValue>({ value: '' })
  const regexHoraire = /^([0-1]\d|2[0-3]):[0-5]\d$/
  const [horaire, setHoraire] = useState<InputValue>({ value: '' })
  const regexDuree = /^\d{2}:\d{2}$/
  const [duree, setDuree] = useState<InputValue>({ value: '' })
  const [adresse, setAdresse] = useState<InputValue>({ value: '' })
  const [organisme, setOrganisme] = useState<InputValue>({ value: '' })
  const [isConseillerPresent, setConseillerPresent] = useState<boolean>(true)
  const [sendEmailInvitation, setSendEmailInvitation] = useState<boolean>(false)
  const [commentaire, setCommentaire] = useState<string>('')

  const [showLeavePageModal, setShowLeavePageModal] = useState<boolean>(false)

  function formHasChanges(): boolean {
    return Boolean(
      codeTypeRendezVous.value ||
        modalite ||
        date.value ||
        horaire.value ||
        duree.value ||
        adresse.value ||
        organisme.value ||
        commentaire
    )
  }

  function dateIsValid(): boolean {
    return regexDate.test(date.value)
  }

  function validateDate() {
    if (!dateIsValid()) {
      setDate({
        ...date,
        error:
          "Le champ date n'est pas valide. Veuillez respecter le format JJ/MM/AAAA",
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
          "Le champ heure n'est pas valide. Veuillez respecter le format HH:MM",
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
          "Le champ durée n'est pas valide. Veuillez respecter le format HH:MM",
      })
    }
  }

  function typeIsValid(): boolean {
    if (!codeTypeRendezVous.value) return false
    if (codeTypeRendezVous.value === TYPE_RENDEZ_VOUS.Autre)
      return Boolean(precisionType.value)
    return true
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

  function formIsValid(): boolean {
    return (
      Boolean(jeuneId) &&
      dateIsValid() &&
      horaireIsValid() &&
      dureeIsValid() &&
      typeIsValid()
    )
  }
  const typeEntretienIndividuelConseillerSelected = () =>
    codeTypeRendezVous.value === TYPE_RENDEZ_VOUS.EntretienIndividuelConseiller

  function handleSelectedTypeRendezVous(e: ChangeEvent<HTMLSelectElement>) {
    setCodeTypeRendezVous({ value: e.target.value })
    setShowPrecisionType(e.target.value === TYPE_RENDEZ_VOUS.Autre)
    if (e.target.value === TYPE_RENDEZ_VOUS.EntretienIndividuelConseiller) {
      return setConseillerPresent(true)
    }
  }

  function handlePresenceConseiller(e: ChangeEvent<HTMLInputElement>) {
    if (typeEntretienIndividuelConseillerSelected()) {
      setConseillerPresent(true)
    } else {
      setConseillerPresent(e.target.checked)
    }
  }

  function handleSendEmailInvitation(e: ChangeEvent<HTMLInputElement>) {
    setSendEmailInvitation(e.target.checked)
  }

  function openLeavePageModal(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setShowLeavePageModal(true)
  }

  async function creerRendezVous(e: FormEvent): Promise<void> {
    e.preventDefault()

    if (!formIsValid()) return Promise.resolve()

    const [dureeHeures, dureeMinutes] = duree.value.split(':')
    await rendezVousService.postNewRendezVous(
      session!.user.id,
      {
        jeuneId,
        type: codeTypeRendezVous.value,
        precision:
          codeTypeRendezVous.value === TYPE_RENDEZ_VOUS.Autre
            ? precisionType.value
            : '',
        modality: modalite ? modalite : undefined,
        date: new Date(`${date.value} ${horaire.value}`).toISOString(),
        duration: parseInt(dureeHeures, 10) * 60 + parseInt(dureeMinutes, 10),
        adresse: adresse.value ? adresse.value : undefined,
        organisme: organisme.value ? organisme.value : undefined,
        presenceConseiller: isConseillerPresent,
        invitation: sendEmailInvitation,
        comment: commentaire,
      },
      session!.accessToken
    )

    if (from.includes('succes')) {
      await router.push(`${from}`)
    } else {
      await router.push(`${from}?creationRdv=succes`)
    }
  }

  useMatomo(`Création RDV${idJeuneFrom ? ' jeune' : ''}`)
  useMatomo(showLeavePageModal ? 'Création rdv - Modale Annulation' : undefined)

  return (
    <>
      <AppHead titre='Nouveau rendez-vous' />
      <div className={`flex items-center ${styles.header}`}>
        {!formHasChanges() && (
          <Link href={from}>
            <a className='items-center mr-4'>
              <BackIcon role='img' focusable='false' aria-hidden={true} />
              <span className='sr-only'>Page précédente</span>
            </a>
          </Link>
        )}
        {formHasChanges() && (
          <button className='items-center mr-4' onClick={openLeavePageModal}>
            <BackIcon role='img' focusable='false' aria-hidden={true} />
            <span className='sr-only'>Quitter la création du rendez-vous</span>
          </button>
        )}

        <h1 className='text-l-medium text-bleu_nuit'>Nouveau rendez-vous</h1>
      </div>
      <div className={`${styles.content} max-w-[500px] m-auto`}>
        <form onSubmit={creerRendezVous}>
          <div className='text-sm-regular text-bleu_nuit mb-8'>
            Tous les champs avec * sont obligatoires
          </div>

          <fieldset className='border-none flex flex-col'>
            <legend className='flex items-center text-m-medium mb-4'>
              <Etape1Icon
                role='img'
                focusable='false'
                aria-label='Étape 1'
                className='mr-2'
              />
              Bénéficiaires :
            </legend>

            <label htmlFor='beneficiaire' className='text-base-medium mb-2'>
              <span aria-hidden={true}>* </span>Rechercher et ajouter un jeune
              <span className='text-bleu_nuit text-sm-regular block'>
                Nom et prénom
              </span>
            </label>
            <select
              id='beneficiaire'
              name='beneficiaire'
              defaultValue={idJeuneFrom ?? ''}
              required={true}
              disabled={Boolean(idJeuneFrom)}
              onChange={(e) => setJeuneId(e.target.value)}
              className={`border border-solid border-content_color rounded-medium w-full px-4 py-3 mb-8 disabled:bg-grey_100`}
            >
              <option aria-hidden hidden disabled value={''} />
              {jeunes.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.lastName} {j.firstName}
                </option>
              ))}
            </select>
          </fieldset>

          <fieldset className='border-none flex flex-col'>
            <legend className='flex items-center text-m-medium mb-4'>
              <Etape2Icon
                role='img'
                focusable='false'
                aria-label='Étape 2'
                className='mr-2'
              />
              Type de rendez-vous :
            </legend>

            <label htmlFor='typeRendezVous' className='text-base-medium mb-2'>
              <span aria-hidden={true}>* </span>Type
            </label>
            {codeTypeRendezVous.error && (
              <InputError id='typeRendezVous--error' className='mb-2'>
                {codeTypeRendezVous.error}
              </InputError>
            )}
            <select
              id='typeRendezVous'
              name='typeRendezVous'
              defaultValue={''}
              required={true}
              onChange={handleSelectedTypeRendezVous}
              className={`border border-solid border-content_color rounded-medium w-full px-4 py-3 mb-8`}
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
                  className='text-base-medium mb-2'
                >
                  <span aria-hidden={true}>* </span>Préciser
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
                  onChange={(e) => setPrecisionType({ value: e.target.value })}
                  onBlur={validateTypeRendezVousAutre}
                  aria-invalid={precisionType.error ? true : undefined}
                  aria-describedby={
                    precisionType.error
                      ? 'typeRendezVous-autre--error'
                      : undefined
                  }
                  className={`border border-solid rounded-medium w-full px-4 py-3 mb-4 ${
                    precisionType.error
                      ? 'border-warning text-warning'
                      : 'border-content_color'
                  }`}
                />
              </>
            )}

            <label htmlFor='modalite' className='text-base-medium mb-2'>
              Modalité
            </label>
            <select
              id='modalite'
              name='modalite'
              defaultValue={''}
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
              <Etape3Icon
                role='img'
                focusable='false'
                aria-label='Étape 3'
                className='mr-2'
              />
              Lieu et date :
            </legend>

            <label htmlFor='date' className='text-base-medium mb-2'>
              <span aria-hidden={true}>* </span>Date
              <span className='ml-8 text-bleu_nuit text-sm-regular'>
                {' '}
                Format : JJ/MM/AAAA
              </span>
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
              required={true}
              onChange={(e) => setDate({ value: e.target.value })}
              onBlur={validateDate}
              aria-invalid={date.error ? true : undefined}
              aria-describedby={date.error ? 'date-error' : undefined}
              className={`border border-solid rounded-medium w-full px-4 py-3 mb-4 ${
                date.error
                  ? 'border-warning text-warning'
                  : 'border-content_color'
              }`}
            />

            <label htmlFor='horaire' className='text-base-medium mb-2'>
              <span aria-hidden='true'>* </span>Heure
              <span className='ml-8 text-bleu_nuit text-sm-regular'>
                {' '}
                Format : HH:MM
              </span>
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
              <span aria-hidden='true'>* </span>Durée
              <span className='ml-8 text-bleu_nuit text-sm-regular'>
                {' '}
                Format : HH:MM
              </span>
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
              onChange={(e) => setDuree({ value: e.target.value })}
              onBlur={validateDuree}
              aria-invalid={duree.error ? true : undefined}
              aria-describedby={duree.error ? 'duree-error' : undefined}
              className={`border border-solid rounded-medium w-full px-4 py-3 mb-8 ${
                duree.error
                  ? 'border-warning text-warning'
                  : 'border-content_color'
              }`}
            />

            <label htmlFor='adresse' className='text-base-medium mb-2'>
              Adresse
              <span className='ml-8 text-bleu_nuit text-sm-regular'>
                {' '}
                Ex: 12 rue duc, Brest
              </span>
            </label>
            <input
              type='text'
              id='adresse'
              name='adresse'
              onChange={(e) => setAdresse({ value: e.target.value })}
              className={
                'border border-solid rounded-medium w-full px-4 py-3 mb-8 bg-location bg-[center_right_1rem] bg-no-repeat'
              }
            />

            <label htmlFor='organisme' className='text-base-medium mb-2'>
              Organisme
              <span className='ml-8 text-bleu_nuit text-sm-regular'>
                Ex: prestataire, entreprise, etc.
              </span>
            </label>
            <input
              type='text'
              id='organisme'
              name='organisme'
              onChange={(e) => setOrganisme({ value: e.target.value })}
              className={
                'border border-solid rounded-medium w-full px-4 py-3 mb-8'
              }
            />
          </fieldset>

          <fieldset className='border-none flex flex-col'>
            <legend className='flex items-center text-m-medium mb-4'>
              <Etape4Icon
                role='img'
                focusable='false'
                aria-label='Étape 4'
                className='mr-2'
              />
              Informations conseiller :
            </legend>

            <div className='flex items-center mb-8'>
              <label htmlFor='presenceConseiller' className='flex items-center'>
                <span className='w-64 mr-4'>
                  Vous êtes présent au rendez-vous
                </span>
                <Switch
                  id='presenceConseiller'
                  name='presenceConseiller'
                  checked={isConseillerPresent}
                  disabled={typeEntretienIndividuelConseillerSelected()}
                  onChange={handlePresenceConseiller}
                />
              </label>
            </div>

            <div className='flex items-center mb-8'>
              <label htmlFor='emailInvitation' className='flex items-center'>
                <span className='w-64 mr-4'>
                  Intégrer ce rendez-vous à mon agenda via l'adresse mail
                  suivante : {emailConseiller}
                </span>
                <Switch
                  id='emailInvitation'
                  name='emailInvitation'
                  checked={sendEmailInvitation}
                  onChange={handleSendEmailInvitation}
                />
              </label>
            </div>

            <label htmlFor='commentaire' className='text-base-regular mb-2'>
              Notes
              <span className='block text-bleu_nuit text-sm-regular'>
                Commentaire à destination des jeunes
              </span>
            </label>
            <textarea
              id='commentaire'
              name='commentaire'
              rows={3}
              onChange={(e) => setCommentaire(e.target.value)}
              className={`border border-solid border-content_color rounded-medium w-full px-4 py-3 mb-8`}
            />
          </fieldset>

          <div className='flex justify-center'>
            {!formHasChanges() && (
              <ButtonLink
                href={from}
                style={ButtonStyle.SECONDARY}
                className='mr-3'
              >
                Annuler
              </ButtonLink>
            )}
            {formHasChanges() && (
              <Button
                aria-label='Quitter la création du rendez-vous'
                onClick={openLeavePageModal}
                style={ButtonStyle.SECONDARY}
                className='mr-3'
              >
                Annuler
              </Button>
            )}

            <Button type='submit' disabled={!formIsValid()}>
              Envoyer
            </Button>
          </div>
        </form>
      </div>
      {showLeavePageModal && (
        <ExitPageConfirmationModal
          id='exit-page-confirmation'
          show={showLeavePageModal}
          message='Vous allez quitter la création d’un nouveau rendez-vous'
          onCancel={() => setShowLeavePageModal(false)}
          href={from}
        />
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<EditionRdvProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.hasSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const jeunesService = withDependance<JeunesService>('jeunesService')
  const rendezVousService =
    withDependance<RendezVousService>('rendezVousService')
  const {
    session: { user, accessToken },
  } = sessionOrRedirect
  const jeunes = await jeunesService.getJeunesDuConseiller(user.id, accessToken)
  const typesRendezVous = await rendezVousService.getTypesRendezVous(
    accessToken
  )

  const referer = context.req.headers.referer

  const props: EditionRdvProps = {
    emailConseiller: user.email,
    jeunes: jeunes,
    typesRendezVous: typesRendezVous,
    withoutChat: true,
    from: referer ?? '/mes-jeunes',
  }

  if (referer) {
    const regex = /mes-jeunes\/(?<idJeune>[\w-]+)/
    const match = regex.exec(referer)
    if (match?.groups?.idJeune) props.idJeuneFrom = match.groups.idJeune
  }

  return { props }
}

export default EditionRdv

import { AppHead } from 'components/AppHead'
import LeavePageModal from 'components/LeavePageModal'
import Button, { ButtonStyle } from 'components/ui/Button'
import { ErrorMessage } from 'components/ui/ErrorMessage'
import { Jeune } from 'interfaces/jeune'
import { GetServerSideProps } from 'next'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { FormEvent, KeyboardEvent, useState } from 'react'
import { modalites } from 'referentiel/rdv'
import { JeunesService } from 'services/jeunes.service'
import { RendezVousService } from 'services/rendez-vous.service'
import styles from 'styles/components/Layouts.module.css'
import linkStyles from 'styles/components/Link.module.css'
import useMatomo from 'utils/analytics/useMatomo'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'
import useRegexpState from 'utils/useRegexpState'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import BackIcon from '../../assets/icons/arrow_back.svg'
import Etape1Icon from '../../assets/icons/etape_1.svg'
import Etape2Icon from '../../assets/icons/etape_2.svg'
import Etape3Icon from '../../assets/icons/etape_3.svg'
import Etape4Icon from '../../assets/icons/etape_4.svg'

interface EditionRdvProps {
  jeunes: Jeune[]
  from: string
  withoutChat: true
  idJeuneFrom?: string
}

function EditionRdv({ jeunes, from, idJeuneFrom }: EditionRdvProps) {
  const { data: session } = useSession({ required: true })
  const rendezVousService =
    useDependance<RendezVousService>('rendezVousService')
  const router = useRouter()

  const [jeuneId, setJeuneId] = useState<string>(idJeuneFrom ?? '')
  const [modalite, setModalite] = useState<string>('')
  const [date, setDate, dateIsValid, validateDate] = useRegexpState(
    /^\d{4}-(0\d|1[0-2])-([0-2]\d|3[01])$/
  )
  const [horaire, setHoraire, horaireIsValid, validateHoraire] = useRegexpState(
    /^([0-1]\d|2[0-3]):[0-5]\d$/
  )
  const [duree, setDuree, dureeIsValid, validateDuree] =
    useRegexpState(/^\d{1,3}$/)
  const [commentaire, setCommentaire] = useState<string>('')

  const [showLeavePageModal, setShowLeavePageModal] = useState<boolean>(false)

  function formHasChanges(): boolean {
    return Boolean(
      modalite || date.value || horaire.value || duree.value || commentaire
    )
  }

  function formIsValid(): boolean {
    return (
      Boolean(jeuneId && modalite) &&
      dateIsValid() &&
      horaireIsValid() &&
      dureeIsValid()
    )
  }

  function goToPreviousPage(): void {
    if (!formHasChanges()) router.push(from)
    else {
      setShowLeavePageModal(true)
    }
  }

  async function creerRendezVous(e: FormEvent): Promise<void> {
    e.preventDefault()

    if (!formIsValid()) return Promise.resolve()

    await rendezVousService.postNewRendezVous(
      session!.user.id,
      {
        jeuneId,
        modality: modalite,
        date: new Date(`${date.value} ${horaire.value}`).toISOString(),
        duration: parseInt(duree.value, 10),
        comment: commentaire,
      },
      session!.accessToken
    )
    await router.push(`${from}?creationRdv=succes`)
  }

  useMatomo(`Création RDV${idJeuneFrom ? ' jeune' : ''}`)
  useMatomo(showLeavePageModal ? 'Création rdv - Modale Annulation' : undefined)

  return (
    <>
      <AppHead titre='Nouveau rendez-vous' />
      <div className={`flex items-center ${styles.header}`}>
        <div
          role='link'
          tabIndex={0}
          className='items-center mr-4 cursor-pointer'
          onClick={goToPreviousPage}
          onKeyPress={(e: KeyboardEvent) => {
            if (e.key === 'Enter') goToPreviousPage()
          }}
        >
          <BackIcon role='img' focusable='false' aria-hidden={true} />
          <span className='sr-only'>Page précédente</span>
        </div>
        <h1 className='text-l-medium text-bleu_nuit'>Nouveau rendez-vous</h1>
      </div>
      <div className={styles.content}>
        <form onSubmit={creerRendezVous}>
          <div
            className='text-sm-regular text-bleu_nuit mb-8'
            aria-hidden={true}
          >
            Tous les champs avec * sont obligatoires
          </div>

          <fieldset className='border-none'>
            <legend className='flex items-center text-m-medium mb-4'>
              <Etape1Icon
                role='img'
                focusable='false'
                aria-label='Étape 1'
                className='mr-2'
              />
              Bénéficiaires :
            </legend>

            <label htmlFor='beneficiaire' className='text-base-medium'>
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
              className={`border border-solid border-primary rounded-medium w-full px-4 py-3 mb-8 disabled:bg-grey_100`}
            >
              <option aria-hidden hidden disabled value={''} />
              {jeunes.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.lastName} {j.firstName}
                </option>
              ))}
            </select>
          </fieldset>

          <fieldset className='border-none'>
            <legend className='flex items-center text-m-medium mb-4'>
              <Etape2Icon
                role='img'
                focusable='false'
                aria-label='Étape 2'
                className='mr-2'
              />
              Type de rendez-vous :
            </legend>

            <label htmlFor='modalite' className='text-base-medium'>
              <span aria-hidden={true}>* </span>Modalité
            </label>
            <select
              id='modalite'
              name='modalite'
              defaultValue={''}
              required={true}
              onChange={(e) => setModalite(e.target.value)}
              className={`border border-solid border-primary rounded-medium w-full px-4 py-3 mb-8`}
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

            <label htmlFor='date' className='text-base-medium'>
              <span aria-hidden={true}>* </span>Date
              <span className='ml-8 text-bleu_nuit text-sm-regular'>
                {' '}
                Format : JJ/MM/AAAA
              </span>
            </label>
            <input
              type='date'
              id='date'
              name='date'
              required={true}
              onChange={(e) => setDate({ value: e.target.value })}
              onBlur={validateDate}
              aria-invalid={date.error ? true : undefined}
              className={`border border-solid rounded-medium w-full px-4 py-3 ${
                date.error
                  ? 'border-warning text-warning'
                  : 'border-primary mb-4'
              }`}
            />
            {date.error && (
              <ErrorMessage className='mb-4'>{date.error}</ErrorMessage>
            )}

            <label htmlFor='horaire' className='text-base-medium'>
              <span aria-hidden='true'>* </span>Heure
              <span className='ml-8 text-bleu_nuit text-sm-regular'>
                {' '}
                Format : HH:MM
              </span>
            </label>
            <input
              type='text'
              id='horaire'
              name='horaire'
              required={true}
              onChange={(e) => setHoraire({ value: e.target.value })}
              onBlur={validateHoraire}
              aria-invalid={horaire.error ? true : undefined}
              className={`border border-solid rounded-medium w-full px-4 py-3 ${
                horaire.error
                  ? 'border-warning text-warning'
                  : 'border-primary mb-4'
              } bg-clock bg-[center_right_1rem] bg-no-repeat`}
            />
            {horaire.error && (
              <ErrorMessage className='mb-4'>{horaire.error}</ErrorMessage>
            )}

            <label htmlFor='duree' className='text-base-medium'>
              <span aria-hidden='true'>* </span>Durée
              <span className='ml-8 text-bleu_nuit text-sm-regular'>
                {' '}
                (en minutes)
              </span>
            </label>
            <input
              type='number'
              id='duree'
              name='duree'
              required={true}
              onChange={(e) => setDuree({ value: e.target.value })}
              onBlur={validateDuree}
              aria-invalid={duree.error ? true : undefined}
              className={`border border-solid rounded-medium w-full px-4 py-3 ${
                duree.error
                  ? 'border-warning text-warning'
                  : 'border-primary mb-8'
              }`}
            />
            {duree.error && (
              <ErrorMessage className='mb-8'>{duree.error}</ErrorMessage>
            )}
          </fieldset>

          <fieldset className='border-none'>
            <legend className='flex items-center text-m-medium mb-4'>
              <Etape4Icon
                role='img'
                focusable='false'
                aria-label='Étape 4'
                className='mr-2'
              />
              Informations conseiller :
            </legend>
            <label htmlFor='commentaire' className='text-base-medium'>
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
            <Button
              type='button'
              role='link'
              tabIndex={0}
              onClick={goToPreviousPage}
              style={ButtonStyle.SECONDARY}
              className={`${linkStyles.linkButtonSecondary} text-sm mr-3`}
            >
              Annuler
            </Button>

            <Button type='submit' disabled={!formIsValid()}>
              Envoyer
            </Button>
          </div>
        </form>
      </div>
      {showLeavePageModal && (
        <LeavePageModal
          show={showLeavePageModal}
          message='Vous allez quitter la création d’un nouveau rendez-vous'
          onCancel={() => setShowLeavePageModal(false)}
          onConfirm={() => router.push(from)}
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
  const {
    session: { user, accessToken },
  } = sessionOrRedirect
  const jeunes = await jeunesService.getJeunesDuConseiller(user.id, accessToken)

  const from: string | undefined = context.query.from as string
  const props: EditionRdvProps = {
    jeunes: jeunes,
    withoutChat: true,
    from: from ?? '/mes-jeunes',
  }

  if (from) {
    const regex = /mes-jeunes\/(?<idJeune>[\w-]+)/
    const match = regex.exec(from)
    if (match?.groups?.idJeune) props.idJeuneFrom = match.groups.idJeune
  }

  return { props }
}

export default EditionRdv

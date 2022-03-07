import { AppHead } from 'components/AppHead'
import Button from 'components/ui/Button'
import { Jeune } from 'interfaces/jeune'
import { GetServerSideProps } from 'next'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FormEvent, useState } from 'react'
import { modalites } from 'referentiel/rdv'
import { JeunesService } from 'services/jeunes.service'
import { RendezVousService } from 'services/rendez-vous.service'
import styles from 'styles/components/Layouts.module.css'
import linkStyles from 'styles/components/Link.module.css'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'
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
  const [date, setDate] = useState<string>('')
  const [horaire, setHoraire] = useState<string>('')
  const [duree, setDuree] = useState<string>('')
  const [commentaire, setCommentaire] = useState<string>('')
  const horairePattern = '^([0-1]\\d|2[0-3]):[0-5]\\d'
  const horaireRegexp: RegExp = new RegExp(horairePattern)

  function formIsValid(): boolean {
    return (
      Boolean(jeuneId && modalite && date && horaire && duree) &&
      horaireRegexp.test(horaire)
    )
  }

  async function creerRendezVous(e: FormEvent): Promise<void> {
    e.preventDefault()

    if (!formIsValid()) return Promise.resolve()

    await rendezVousService.postNewRendezVous(
      session!.user.id,
      {
        jeuneId,
        modality: modalite,
        date: new Date(`${date} ${horaire}`).toISOString(),
        duration: parseInt(duree, 10),
        comment: commentaire,
      },
      session!.accessToken
    )
    await router.push(`${from}?creationRdv=succes`)
  }

  return (
    <>
      <AppHead titre='Nouveau rendez-vous' />
      <div className={`flex items-center ${styles.header}`}>
        <Link href={from}>
          <a className='items-center mr-4'>
            <BackIcon role='img' focusable='false' aria-hidden={true} />
            <span className='sr-only'>Page précédente</span>
          </a>
        </Link>
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
            >
              <option aria-hidden hidden disabled value={''} />
              {modalites.map((md) => (
                <option key={md} value={md}>
                  {md}
                </option>
              ))}
            </select>
          </fieldset>

          <fieldset className='border-none'>
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
              <span> Format : JJ/MM/AAAA</span>
            </label>
            <input
              type='date'
              id='date'
              name='date'
              required={true}
              onChange={(e) => setDate(e.target.value)}
            />

            <label htmlFor='horaire' className='text-base-medium'>
              <span aria-hidden='true'>* </span>Heure
              <span> Format : HH:MM</span>
            </label>
            <input
              type='text'
              id='horaire'
              name='horaire'
              required={true}
              pattern={horairePattern}
              onChange={(e) => setHoraire(e.target.value)}
            />

            <label htmlFor='duree' className='text-base-medium'>
              <span aria-hidden='true'>* </span>Durée (en minutes)
            </label>
            <input
              type='number'
              id='duree'
              name='duree'
              required={true}
              onChange={(e) => setDuree(e.target.value)}
            />
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
              <span className='block'>
                Commentaire à destination des jeunes
              </span>
            </label>
            <textarea
              id='commentaire'
              name='commentaire'
              onChange={(e) => setCommentaire(e.target.value)}
            />
          </fieldset>

          <div>
            <Link href={from}>
              <a className={`${linkStyles.linkButtonSecondary} text-sm`}>
                Annuler
              </a>
            </Link>

            <Button type='submit' disabled={!formIsValid()}>
              Envoyer
            </Button>
          </div>
        </form>
      </div>
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

import { AppHead } from 'components/AppHead'
import { Jeune } from 'interfaces/jeune'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { modalites } from 'referentiel/rdv'
import { JeunesService } from 'services/jeunes.service'
import styles from 'styles/components/Layouts.module.css'
import withDependance from 'utils/injectionDependances/withDependance'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import BackIcon from '../../assets/icons/arrow_back.svg'
import Etape1Icon from '../../assets/icons/etape_1.svg'
import Etape2Icon from '../../assets/icons/etape_2.svg'
import Etape3Icon from '../../assets/icons/etape_3.svg'

interface EditionRdvProps {
  jeunes: Jeune[]
  from: string
  withoutChat: true
}

function EditionRdv({ jeunes, from }: EditionRdvProps) {
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
        <form>
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
              <br />
              <span className='text-bleu_nuit text-sm-regular'>
                Nom et prénom
              </span>
            </label>
            <select
              id='beneficiaire'
              name='beneficiaire'
              required={true}
              value={''}
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
            <select id='modalite' name='modalite' value={''} required={true}>
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
            <input type='date' id='date' name='date' required={true} />

            <label htmlFor='horaire' className='text-base-medium'>
              <span aria-hidden='true'>* </span>Heure
              <span> Format : HH:MM</span>
            </label>
            <input type='text' id='horaire' name='horaire' required={true} />

            <label htmlFor='duree' className='text-base-medium'>
              <span aria-hidden='true'>* </span>Durée (en minutes)
            </label>
            <input type='number' id='duree' name='duree' required={true} />
          </fieldset>
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

  return {
    props: {
      jeunes: jeunes,
      withoutChat: true,
      from: (context.query.from as string) ?? '/mes-jeunes',
    },
  }
}

export default EditionRdv

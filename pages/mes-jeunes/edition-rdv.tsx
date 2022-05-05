import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'

import BackIcon from '../../assets/icons/arrow_back.svg'

import ExitPageConfirmationModal from 'components/ExitPageConfirmationModal'
import { EditionRdvForm } from 'components/rdv/EditionRdvForm'
import { Jeune } from 'interfaces/jeune'
import { RdvFormData } from 'interfaces/json/rdv'
import { Rdv, TypeRendezVous } from 'interfaces/rdv'
import { JeunesService } from 'services/jeunes.service'
import { RendezVousService } from 'services/rendez-vous.service'
import styles from 'styles/components/Layouts.module.css'
import useMatomo from 'utils/analytics/useMatomo'
import useSession from 'utils/auth/useSession'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

interface EditionRdvProps {
  jeunes: Jeune[]
  typesRendezVous: TypeRendezVous[]
  redirectTo: string
  withoutChat: true
  idJeune?: string
  rdv?: Rdv
  pageTitle: string
}

function EditionRdv({
  jeunes,
  typesRendezVous,
  idJeune,
  redirectTo,
  rdv,
}: EditionRdvProps) {
  const router = useRouter()
  const rendezVousService =
    useDependance<RendezVousService>('rendezVousService')

  const { data: session } = useSession<true>({ required: true })
  const [showLeavePageModal, setShowLeavePageModal] = useState<boolean>(false)
  const [hasChanges, setHasChanges] = useState<boolean>(false)

  let initialTracking: string
  if (rdv) initialTracking = `Modification RDV`
  else initialTracking = `Création RDV${idJeune ? ' jeune' : ''}`
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  function openLeavePageModal() {
    setShowLeavePageModal(true)
    setTrackingTitle(
      `${rdv ? 'Modification' : 'Création'} rdv - Modale Annulation`
    )
  }

  function closeLeavePageModal() {
    setShowLeavePageModal(false)
    setTrackingTitle(initialTracking)
  }

  async function soumettreRendezVous(payload: RdvFormData): Promise<void> {
    if (!rdv) {
      await rendezVousService.postNewRendezVous(
        session!.user.id,
        payload,
        session!.accessToken
      )
    } else {
      await rendezVousService.updateRendezVous(
        rdv.id,
        payload,
        session!.accessToken
      )
    }

    const [redirectPath] = redirectTo.split('?')
    const queryParam = rdv ? 'modificationRdv' : 'creationRdv'
    await router.push(`${redirectPath}?${queryParam}=succes`)
  }

  useMatomo(trackingTitle)

  return (
    <>
      <div className={`flex items-center ${styles.header}`}>
        {!hasChanges && (
          <Link href={redirectTo}>
            <a className='items-center mr-4'>
              <BackIcon role='img' focusable='false' aria-hidden={true} />
              <span className='sr-only'>Page précédente</span>
            </a>
          </Link>
        )}
        {hasChanges && (
          <button className='items-center mr-4' onClick={openLeavePageModal}>
            <BackIcon role='img' focusable='false' aria-hidden={true} />
            <span className='sr-only'>
              Quitter la {rdv ? 'modification' : 'création'} du rendez-vous
            </span>
          </button>
        )}

        <h1 className='text-l-medium text-bleu_nuit'>{`${
          rdv ? 'Modification' : 'Nouveau'
        } rendez-vous`}</h1>
      </div>
      <div className={`${styles.content} ${styles.content_without_chat}`}>
        <EditionRdvForm
          jeunes={jeunes}
          typesRendezVous={typesRendezVous}
          idJeune={idJeune}
          rdv={rdv}
          redirectTo={redirectTo}
          conseillerIsCreator={!rdv || session?.user.id === rdv.idCreateur}
          conseillerEmail={session?.user.email ?? ''}
          onChanges={setHasChanges}
          soumettreRendezVous={soumettreRendezVous}
          leaveWithChanges={openLeavePageModal}
        />
      </div>
      {showLeavePageModal && (
        <ExitPageConfirmationModal
          message={`Vous allez quitter la ${
            rdv ? 'modification du' : 'création d’un nouveau'
          } rendez-vous`}
          source={rdv ? 'edition' : 'creation'}
          onCancel={closeLeavePageModal}
          destination={redirectTo}
        />
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<EditionRdvProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
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
  const redirectTo =
    referer && !comingFromHome(referer) ? referer : '/mes-jeunes'
  const props: EditionRdvProps = {
    jeunes: jeunes,
    typesRendezVous: typesRendezVous,
    withoutChat: true,
    redirectTo,
    pageTitle: 'Nouveau rendez-vous',
  }

  const idRdv = context.query.idRdv as string | undefined
  if (idRdv) {
    const rdv = await rendezVousService.getDetailsRendezVous(idRdv, accessToken)
    if (!rdv) return { notFound: true }
    props.rdv = rdv
    props.idJeune = rdv.jeune.id
    props.pageTitle = 'Modification rendez-vous'
  } else if (referer) {
    const regex = /mes-jeunes\/(?<idJeune>[\w-]+)/
    const match = regex.exec(referer)
    if (match?.groups?.idJeune) props.idJeune = match.groups.idJeune
  }

  return { props }
}

export default withTransaction(EditionRdv.name, 'page')(EditionRdv)

function comingFromHome(referer: string): boolean {
  return referer.split('?')[0].endsWith('/index')
}

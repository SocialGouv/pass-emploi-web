import { AppHead } from 'components/AppHead'
import DeleteRdvModal from 'components/rdv/DeleteRdvModal'
import RdvList from 'components/rdv/RdvList'
import SuccessMessage from 'components/SuccessMessage'
import Button, { ButtonStyle } from 'components/ui/Button'
import { UserStructure } from 'interfaces/conseiller'
import { Rdv } from 'interfaces/rdv'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { RendezVousService } from 'services/rendez-vous.service'
import styles from 'styles/components/Layouts.module.css'
import useMatomo from 'utils/analytics/useMatomo'
import withDependance from 'utils/injectionDependances/withDependance'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'

type MesRendezvousProps = {
  rendezVousFuturs: Rdv[]
  rendezVousPasses: Rdv[]
  succesCreation?: boolean
}

const MesRendezvous = ({
  rendezVousFuturs,
  rendezVousPasses,
  succesCreation,
}: MesRendezvousProps) => {
  const router = useRouter()
  const [showRdvCreationSuccess, setShowRdvCreationSuccess] = useState<boolean>(
    succesCreation ?? false
  )
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [displayOldRdv, setDisplayOldRdv] = useState(false)
  const [selectedRdv, setSelectedRdv] = useState<Rdv | undefined>(undefined)
  const [rdvsAVenir, setRdvsAVenir] = useState(rendezVousFuturs)
  const pageTracking = `Mes rendez-vous`
  const initialTracking = `${pageTracking}${
    succesCreation ? ' - Creation rdv succès' : ''
  }`
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  function deleteRdv() {
    const index = rdvsAVenir.indexOf(selectedRdv!)
    const newArray = [
      ...rdvsAVenir.slice(0, index),
      ...rdvsAVenir.slice(index + 1, rdvsAVenir.length),
    ]
    setRdvsAVenir(newArray)
  }

  function toggleDisplayOldRdv(): void {
    setDisplayOldRdv(!displayOldRdv)
    if (displayOldRdv) {
      setTrackingTitle('Mes rendez-vous passés')
    } else {
      setTrackingTitle(pageTracking)
    }
  }

  function closeRdvCreationMessage(): void {
    setShowRdvCreationSuccess(false)
    router.replace('', undefined, { shallow: true })
  }

  function openDeleteRdvModal(rdv: Rdv) {
    setSelectedRdv(rdv)
    setShowDeleteModal(true)
    setTrackingTitle('Mes rendez-vous - Modale suppression rdv')
  }

  function closeDeleteRdvModal() {
    setShowDeleteModal(false)
    setTrackingTitle(pageTracking)
  }

  useMatomo(trackingTitle)

  return (
    <>
      <AppHead titre='Tableau de bord - Mes rendez-vous' />
      <span
        className={`flex flex-wrap justify-between items-center ${styles.header}`}
      >
        <h1 className='h2-semi text-bleu_nuit'>Rendez-vous</h1>
        <Button href={'/mes-jeunes/edition-rdv?from=/mes-rendezvous'}>
          Fixer un rendez-vous
        </Button>
      </span>

      <div className={styles.content}>
        {showRdvCreationSuccess && (
          <SuccessMessage
            label={'Le rendez-vous a bien été créé'}
            onAcknowledge={closeRdvCreationMessage}
          />
        )}
        <div role='tablist' className='flex mb-[40px]'>
          <Button
            role='tab'
            type='button'
            controls='rendez-vous-futurs'
            className='mr-[8px]'
            style={displayOldRdv ? ButtonStyle.SECONDARY : ButtonStyle.PRIMARY}
            onClick={toggleDisplayOldRdv}
          >
            Prochains rendez-vous
          </Button>

          <Button
            role='tab'
            type='button'
            controls='rendez-vous-passes'
            style={displayOldRdv ? ButtonStyle.PRIMARY : ButtonStyle.SECONDARY}
            onClick={toggleDisplayOldRdv}
          >
            Rendez-vous passés
          </Button>
        </div>

        {displayOldRdv ? (
          <RdvList id='rendez-vous-passes' rdvs={rendezVousPasses} />
        ) : (
          <RdvList
            id='rendez-vous-futurs'
            rdvs={rdvsAVenir}
            onDelete={openDeleteRdvModal}
          />
        )}

        {showDeleteModal && (
          <DeleteRdvModal
            onClose={closeDeleteRdvModal}
            onDelete={deleteRdv}
            show={showDeleteModal}
            rdv={selectedRdv!}
          />
        )}
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  MesRendezvousProps
> = async (context): Promise<GetServerSidePropsResult<MesRendezvousProps>> => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.hasSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user, accessToken },
  } = sessionOrRedirect
  if (user.structure === UserStructure.POLE_EMPLOI) {
    return { notFound: true }
  }

  const rendezVousService =
    withDependance<RendezVousService>('rendezVousService')
  const { passes, futurs } = await rendezVousService.getRendezVousConseiller(
    user.id,
    accessToken
  )

  const props: MesRendezvousProps = {
    rendezVousFuturs: futurs,
    rendezVousPasses: passes,
  }
  if (context.query.creationRdv)
    props.succesCreation = context.query.creationRdv === 'succes'
  return { props }
}

export default MesRendezvous

import { AppHead } from 'components/AppHead'
import AddRdvModal from 'components/rdv/AddRdvModal'
import DeleteRdvModal from 'components/rdv/DeleteRdvModal'
import RdvList from 'components/rdv/RdvList'
import Button, { ButtonColorStyle } from 'components/ui/Button'
import { UserStructure } from 'interfaces/conseiller'
import { jsonToRdv, RdvFormData } from 'interfaces/json/rdv'
import { Rdv } from 'interfaces/rdv'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import { useSession } from 'next-auth/react'
import Router from 'next/router'
import { useState } from 'react'
import { JeunesService } from 'services/jeunes.service'
import { RendezVousService } from 'services/rendez-vous.service'
import useMatomo from 'utils/analytics/useMatomo'
import { Container, useDependance } from 'utils/injectionDependances'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import AddIcon from '../../assets/icons/add.svg'

type MesRendezvousProps = {
  rendezVousFuturs: Rdv[]
  rendezVousPasses: Rdv[]
}

const MesRendezvous = ({
  rendezVousFuturs,
  rendezVousPasses,
}: MesRendezvousProps) => {
  const { data: session } = useSession({ required: true })
  const jeunesService = useDependance<JeunesService>('jeunesService')
  const rendezVousService =
    useDependance<RendezVousService>('rendezVousService')
  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [displayOldRdv, setDisplayOldRdv] = useState(false)
  const [selectedRdv, setSelectedRdv] = useState<Rdv | undefined>(undefined)
  const [rdvsAVenir, setRdvsAVenir] = useState(rendezVousFuturs)
  const initialTracking = 'Mes rendez-vous'
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  function openAddModal(): void {
    setShowAddModal(true)
    setTrackingTitle('Mes rendez-vous - Modale création rdv')
  }

  function closeAddModal(): void {
    setShowAddModal(false)
    setTrackingTitle(initialTracking)
  }

  async function addNewRDV(newRDV: RdvFormData): Promise<void> {
    await rendezVousService.postNewRendezVous(
      session!.user.id,
      newRDV,
      session!.accessToken
    )
    closeAddModal()
    Router.reload()
  }

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
      setTrackingTitle(initialTracking)
    }
  }

  function openDeleteRdvModal(rdv: Rdv) {
    setSelectedRdv(rdv)
    setShowDeleteModal(true)
    setTrackingTitle('Mes rendez-vous - Modale suppression rdv')
  }

  function closeDeleteRdvModal() {
    setShowDeleteModal(false)
    setTrackingTitle(initialTracking)
  }

  useMatomo(trackingTitle)

  return (
    <>
      <AppHead titre='Tableau de bord - Mes rendez-vous' />
      <span className='flex flex-wrap justify-between mb-[20px]'>
        <h1 className='h2-semi text-bleu_nuit'>Rendez-vous</h1>
        <Button onClick={openAddModal} label='Fixer un rendez-vous'>
          <AddIcon focusable='false' aria-hidden='true' />
          Fixer un rendez-vous
        </Button>
      </span>

      <div role='tablist' className='flex mb-[40px]'>
        <Button
          role='tab'
          type='button'
          className='mr-[8px]'
          style={displayOldRdv ? ButtonColorStyle.WHITE : ButtonColorStyle.BLUE}
          onClick={toggleDisplayOldRdv}
        >
          Prochains rendez-vous
        </Button>

        <Button
          role='tab'
          type='button'
          style={displayOldRdv ? ButtonColorStyle.BLUE : ButtonColorStyle.WHITE}
          onClick={toggleDisplayOldRdv}
        >
          Rendez-vous passés
        </Button>
      </div>

      {displayOldRdv ? (
        <RdvList rdvs={rendezVousPasses} />
      ) : (
        <RdvList rdvs={rdvsAVenir} onDelete={openDeleteRdvModal} />
      )}

      {showAddModal && session && (
        <AddRdvModal
          fetchJeunes={() =>
            jeunesService.getJeunesDuConseiller(
              session.user.id,
              session.accessToken
            )
          }
          addNewRDV={addNewRDV}
          onClose={closeAddModal}
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

  const { rendezVousService } = Container.getDIContainer().dependances
  const data = await rendezVousService.getRendezVousConseiller(
    user.id,
    accessToken
  )
  if (!data) {
    return { notFound: true }
  }

  const rendezVousPasses: Rdv[] = data.passes.map(jsonToRdv)
  const rendezVousFuturs: Rdv[] = data.futurs.map(jsonToRdv)

  return {
    props: {
      rendezVousFuturs,
      rendezVousPasses,
    },
  }
}

export default MesRendezvous

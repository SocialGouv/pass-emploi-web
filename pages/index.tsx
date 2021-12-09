import { AppHead } from 'components/AppHead'
import Button, { ButtonColorStyle } from 'components/Button'
import AddRdvModal from 'components/rdv/AddRdvModal'
import DeleteRdvModal from 'components/rdv/DeleteRdvModal'
import RdvList from 'components/rdv/RdvList'
import { RdvFormData, RdvJson } from 'interfaces/json/rdv'
import { Rdv } from 'interfaces/rdv'
import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import { useSession } from 'next-auth/react'
import Router from 'next/router'
import { useEffect, useState } from 'react'
import { durees } from 'referentiel/rdv'
import useMatomo from 'utils/analytics/useMatomo'
import { Container, useDIContext } from 'utils/injectionDependances'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import AddIcon from '../assets/icons/add.svg'

type HomeProps = {
  rendezVousFuturs: Rdv[]
  rendezVousPasses: Rdv[]
}

const Home = ({ rendezVousFuturs, rendezVousPasses }: HomeProps) => {
  const { data: session } = useSession({ required: true })
  const { jeunesService, rendezVousService } = useDIContext()
  const [showAddModal, setShowAddModal] = useState<boolean | undefined>(
    undefined
  )
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [displayOldRdv, setDisplayOldRdv] = useState(false)
  const [selectedRdv, setSelectedRdv] = useState<Rdv | undefined>(undefined)
  const [rdvsAVenir, setRdvsAVenir] = useState(rendezVousFuturs)

  function openAddModal(): void {
    setShowAddModal(true)
  }

  function closeAddModal(): void {
    setShowAddModal(false)
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

  useMatomo(displayOldRdv ? 'Mes rendez-vous passés' : 'Mes rendez-vous')

  useMatomo(
    showAddModal
      ? 'Mes rendez-vous - Modale création rdv'
      : showAddModal === undefined
      ? undefined
      : 'Mes rendez-vous'
  )

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
          onClick={() => {
            setDisplayOldRdv(!displayOldRdv)
          }}
        >
          Prochains rendez-vous
        </Button>

        <Button
          role='tab'
          type='button'
          style={displayOldRdv ? ButtonColorStyle.BLUE : ButtonColorStyle.WHITE}
          onClick={() => {
            setDisplayOldRdv(!displayOldRdv)
          }}
        >
          Rendez-vous passés
        </Button>
      </div>

      {displayOldRdv ? (
        <RdvList rdvs={rendezVousPasses} />
      ) : (
        <RdvList
          rdvs={rdvsAVenir}
          onDelete={(rdv: Rdv) => {
            setShowDeleteModal(true)
            setSelectedRdv(rdv)
          }}
        />
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
          onClose={() => setShowDeleteModal(false)}
          onDelete={deleteRdv}
          show={showDeleteModal}
          rdv={selectedRdv!}
        />
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async (
  context
): Promise<GetServerSidePropsResult<HomeProps>> => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.hasSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user, accessToken },
  } = sessionOrRedirect
  const { rendezVousService } = Container.getDIContainer().dependances
  const data = await rendezVousService.getRendezVousConseiller(
    user.id,
    accessToken
  )
  if (!data) {
    return {
      notFound: true,
    }
  }

  const rendezVousPasses: Rdv[] = data.passes.map((rdvData: RdvJson) => ({
    ...rdvData,
    duration:
      durees.find((duree: any) => duree.value === rdvData.duration)?.text ||
      `${rdvData.duration} min`,
  }))
  const rendezVousFuturs: Rdv[] = data.futurs.map((rdvData: RdvJson) => ({
    ...rdvData,
    duration:
      durees.find((duree: any) => duree.value === rdvData.duration)?.text ||
      `${rdvData.duration} min`,
  }))

  return {
    props: {
      rendezVousFuturs,
      rendezVousPasses,
    },
  }
}

export default Home

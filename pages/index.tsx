import Button, { ButtonColorStyle } from 'components/Button'
import AddRdvModal from 'components/rdv/AddRdvModal'
import DeleteRdvModal from 'components/rdv/DeleteRdvModal'
import RdvList from 'components/rdv/RdvList'
import { RdvJson } from 'interfaces/json/rdv'
import { Rdv } from 'interfaces/rdv'
import { GetServerSidePropsResult } from 'next'
import Router from 'next/router'
import { useState } from 'react'
import { durees } from 'referentiel/rdv'
import fetchJson from 'utils/fetchJson'
import withSession, {
  getConseillerFromSession,
  ServerSideHandler,
} from 'utils/session'
import AddIcon from '../assets/icons/add.svg'
import { useDIContext } from '../utils/injectionDependances'

type HomeProps = {
  idConseiller: string
  rendezVousFuturs: Rdv[]
  rendezVousPasses: Rdv[]
}

const Home = ({
  idConseiller,
  rendezVousFuturs,
  rendezVousPasses,
}: HomeProps) => {
  const { jeunesService, rendezVousService } = useDIContext()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [displayOldRdv, setDisplayOldRdv] = useState(false)
  const [selectedRdv, setSelectedRdv] = useState<Rdv | undefined>(undefined)
  const [rdvsAVenir, setRdvsAVenir] = useState(rendezVousFuturs)

  function deleteRdv() {
    return () => {
      const index = rdvsAVenir.indexOf(selectedRdv!)
      const newArray = [
        ...rdvsAVenir.slice(0, index),
        ...rdvsAVenir.slice(index + 1, rdvsAVenir.length),
      ]
      setRdvsAVenir(newArray)
    }
  }

  return (
    <>
      <span className='flex flex-wrap justify-between mb-[20px]'>
        <h1 className='h2-semi text-bleu_nuit'>Rendez-vous</h1>
        <Button
          onClick={() => setShowAddModal(true)}
          label='Fixer un rendez-vous'
        >
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

      {showAddModal && (
        <AddRdvModal
          fetchJeunes={() => jeunesService.getJeunesDuConseiller(idConseiller)}
          saveNewRDV={(newRDV) =>
            rendezVousService.postNewRendezVous(idConseiller, newRDV)
          }
          onClose={() => setShowAddModal(false)}
          onAdd={Router.reload}
        />
      )}

      {showDeleteModal && (
        <DeleteRdvModal
          onClose={() => setShowDeleteModal(false)}
          onDelete={deleteRdv()}
          show={showDeleteModal}
          rdv={selectedRdv!}
        />
      )}
    </>
  )
}

export const getServerSideProps = withSession<ServerSideHandler<HomeProps>>(
  async ({ req }): Promise<GetServerSidePropsResult<HomeProps>> => {
    const conseillerOuRedirect = getConseillerFromSession(req)
    if (!conseillerOuRedirect.hasConseiller) {
      return { redirect: conseillerOuRedirect.redirect }
    }

    const { conseiller } = conseillerOuRedirect
    const data = await fetchJson(
      `${process.env.API_ENDPOINT}/conseillers/${conseiller.id}/rendezvous`
    )

    const rendezVousPasses: Rdv[] = data.passes.map((rdvData: RdvJson) => {
      return {
        ...rdvData,
        duration:
          durees.find((duree: any) => duree.value === rdvData.duration)?.text ||
          `${rdvData.duration} min`,
      }
    })

    const rendezVousFuturs: Rdv[] = data.futurs.map((rdvData: RdvJson) => {
      return {
        ...rdvData,
        duration:
          durees.find((duree: any) => duree.value === rdvData.duration)?.text ||
          `${rdvData.duration} min`,
      }
    })

    if (!data) {
      return {
        notFound: true,
      }
    }

    return {
      props: {
        idConseiller: conseiller.id,
        rendezVousFuturs: rendezVousFuturs,
        rendezVousPasses: rendezVousPasses,
      },
    }
  }
)

export default Home

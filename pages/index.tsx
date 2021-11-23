import Button, { ButtonColorStyle } from 'components/Button'
import AddRdvModal from 'components/rdv/AddRdvModal'
import DeleteRdvModal from 'components/rdv/DeleteRdvModal'
import RdvList from 'components/rdv/RdvList'
import { RdvJson } from 'interfaces/json/rdv'
import { Rdv} from 'interfaces/rdv'
import Router from 'next/router'
import { useState } from 'react'
import { durees } from 'referentiel/rdv'
import fetchJson from 'utils/fetchJson'
import withSession, { ServerSideHandler} from 'utils/session'
import AddIcon from '../assets/icons/add.svg'

type HomeProps = {
  rdvs: Rdv[]
  oldRdvs: Rdv[]
}

const defaultRdv = {
  id: 'string',
  title: 'string',
  subtitle: 'string',
  comment: 'string',
  date: 'string',
  duration: 'string',
  modality: 'string',
}

const Home = ({ rdvs, oldRdvs }: HomeProps) => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [displayOldRdv, setDisplayOldRdv] = useState(false)
  const [selectedRdv, setSelectedRdv] = useState(defaultRdv)
  const [rdvsAvenir, setRdvsAvenir] = useState(rdvs)

  function deleteRdv() {
        return () => {
            const index = rdvsAvenir.indexOf(selectedRdv)
            const newArray = [
                ...rdvsAvenir.slice(0, index),
                ...rdvsAvenir.slice(index + 1, rdvsAvenir.length),
            ]
            setRdvsAvenir(newArray)
        }
    }return (
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
        <RdvList rdvs={oldRdvs} />
      ) : (
        <RdvList
          rdvs={rdvsAvenir}
          onDelete={(rdv: Rdv) => {
            setShowDeleteModal(true)
            setSelectedRdv(rdv)
          }}
        />
      )}

      {showAddModal && (
        <AddRdvModal
          onClose={() => setShowAddModal(false)}
          onAdd={() => {
            Router.reload()
          }}
          show={showAddModal}
        />
      )}

      {showDeleteModal && (
        <DeleteRdvModal
          onClose={() => setShowDeleteModal(false)}
          onDelete={deleteRdv()}
          show={showDeleteModal}
          rdv={selectedRdv}
        />
      )}
    </>
  )
}

export const getServerSideProps = withSession<ServerSideHandler>(
  async ({ req, res }) => {
    const user = req.session.get('user')

    if (user === undefined) {
      res.setHeader('location', '/login')
      res.statusCode = 302
      res.end()
      return {
        props: {},
      }
    }

    const data = await fetchJson(
      `${process.env.API_ENDPOINT}/conseillers/${user.id}/rendezvous`
    )

    let serializedRdvs: Rdv[] = []

    data.map((rdvData: RdvJson) => {
      const newrdv: Rdv = {
        ...rdvData,
        duration:
          durees.find((duree: any) => duree.value === rdvData.duration)?.text ||
          `${rdvData.duration} min`,
      }

      serializedRdvs.push(newrdv)
    })

    if (!data) {
      return {
        notFound: true,
      }
    }

    const today = new Date()

    return {
      props: {
        rdvs: serializedRdvs.filter((rdv) => new Date(rdv.date) >= today),
        oldRdvs: serializedRdvs.filter((rdv) => new Date(rdv.date) < today),
      },
    }
  }
)

export default Home

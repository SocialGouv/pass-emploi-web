import { DetailsJeune } from 'components/jeune/DetailsJeune'
import ListeActionsJeune from 'components/jeune/ListeActionsJeune'
import ListeRdvJeune from 'components/jeune/ListeRdvJeune'
import DeleteRdvModal from 'components/rdv/DeleteRdvModal'
import { Jeune } from 'interfaces'
import { RdvJeune } from 'interfaces/rdv'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import React, { useState } from 'react'
import fetchJson from 'utils/fetchJson'
import BackIcon from '../../../assets/icons/arrow_back.svg'

interface FicheJeuneProps {
  jeune: Jeune
  rdvs: RdvJeune[]
}

const FicheJeune = ({ jeune, rdvs }: FicheJeuneProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [rdvsAVenir, setRdvsAVenir] = useState(rdvs)
  const [selectedRdv, setSelectedRdv] = useState<RdvJeune | undefined>(
    undefined
  )

  function deleteRdv() {
    if (selectedRdv) {
      const index = rdvsAVenir.indexOf(selectedRdv)
      const nouvelleListeRdvs = [
        ...rdvsAVenir.slice(0, index),
        ...rdvsAVenir.slice(index + 1, rdvsAVenir.length),
      ]
      setRdvsAVenir(nouvelleListeRdvs)
    }
  }

  return (
    <div className={'flex flex-col'}>
      <div className={'flex items-center mb-8'}>
        <Link href='/mes-jeunes' passHref>
          <a className='mr-6'>
            <BackIcon
              role='img'
              focusable='false'
              aria-label='Retour sur la liste de tous les jeunes'
            />
          </a>
        </Link>
        <p className='h4-semi text-bleu_nuit'>Liste de mes jeunes</p>
      </div>

      <DetailsJeune jeune={jeune} />

      <div className='mt-8 border-b border-bleu_blanc'>
        <h2 className='h4-semi text-bleu_nuit mb-4'>
          Rendez-vous ({rdvs?.length})
        </h2>

        <ListeRdvJeune
          rdvs={rdvsAVenir}
          onDelete={(rdv: RdvJeune) => {
            setShowDeleteModal(true), setSelectedRdv(rdv)
          }}
        />
      </div>

      <div className='mt-8 border-b border-bleu_blanc pb-8'>
        <h2 className='h4-semi text-bleu_nuit mb-4'>Actions</h2>

        <ListeActionsJeune idJeune={jeune.id} />
      </div>

      {showDeleteModal && selectedRdv && (
        <DeleteRdvModal
          onClose={() => setShowDeleteModal(false)}
          onDelete={deleteRdv}
          show={showDeleteModal}
          rdv={selectedRdv}
        />
      )}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const [resInfoJeune, resRdvJeune] = await Promise.all([
    fetchJson(`${process.env.API_ENDPOINT}/jeunes/${query.jeune_id}/`),
    fetchJson(
      `${process.env.API_ENDPOINT}/jeunes/${query.jeune_id}/rendezvous`
    ),
  ])

  if (!resInfoJeune || !resRdvJeune) {
    return {
      notFound: true,
    }
  }
  const today = new Date()

  const rdvsTriesParLePlusProche = resRdvJeune.sort(
    (rdv1: RdvJeune, rdv2: RdvJeune) =>
      new Date(rdv1.date).getTime() - new Date(rdv2.date).getTime()
  )

  return {
    props: {
      jeune: resInfoJeune,
      rdvs: rdvsTriesParLePlusProche.filter(
        (rdv: RdvJeune) => new Date(rdv.date) > today
      ),
    },
  }
}

export default FicheJeune

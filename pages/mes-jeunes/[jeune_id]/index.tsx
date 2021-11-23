import React, { useState } from 'react'
import Link from 'next/link'
import BackIcon from '../../../assets/icons/arrow_back.svg'
import { Jeune } from 'interfaces'
import { DetailsJeune } from 'components/jeune/DetailsJeune'
import { GetServerSideProps } from 'next'
import fetchJson from 'utils/fetchJson'
import { RdvJeune } from 'interfaces/rdv'
import DeleteRdvModal from 'components/rdv/DeleteRdvModal'
import ListeRdvJeune from 'components/jeune/ListeRdvJeune'

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
      <DetailsJeune jeune={jeune} rdv={rdvsAVenir} />
      <ListeRdvJeune
        rdvs={rdvsAVenir}
        onDelete={(rdv: RdvJeune) => {
          setShowDeleteModal(true), setSelectedRdv(rdv)
        }}
      />

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
  return {
    props: {
      jeune: resInfoJeune,
      rdvs: resRdvJeune.filter((rdv: RdvJeune) => new Date(rdv.date) >= today),
    },
  }
}

export default FicheJeune

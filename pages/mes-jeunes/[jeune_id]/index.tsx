import Button, { ButtonColorStyle } from 'components/Button'
import { DetailsJeune } from 'components/jeune/DetailsJeune'
import ListeActionsJeune from 'components/jeune/ListeActionsJeune'
import ListeRdvJeune from 'components/jeune/ListeRdvJeune'
import AddRdvModal from 'components/rdv/AddRdvModal'
import DeleteRdvModal from 'components/rdv/DeleteRdvModal'
import { AppHead } from 'components/AppHead'
import { Conseiller, Jeune } from 'interfaces'
import { RdvFormData } from 'interfaces/json/rdv'
import { RdvJeune } from 'interfaces/rdv'
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next'
import Link from 'next/link'
import Router from 'next/router'
import React, { useState } from 'react'
import fetchJson from 'utils/fetchJson'
import { useDIContext } from 'utils/injectionDependances'
import BackIcon from '../../../assets/icons/arrow_back.svg'
import { getSession } from 'next-auth/react'

interface FicheJeuneProps {
  idConseiller: string
  jeune: Jeune
  rdvs: RdvJeune[]
}

const FicheJeune = ({ idConseiller, jeune, rdvs }: FicheJeuneProps) => {
  const { jeunesService, rendezVousService } = useDIContext()
  const [showAddRdvModal, setShowAddRdvModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [rdvsAVenir, setRdvsAVenir] = useState(rdvs)
  const [selectedRdv, setSelectedRdv] = useState<RdvJeune | undefined>(
    undefined
  )

  function openAddRdvModal(): void {
    setShowAddRdvModal(true)
  }

  function closeAddRdvModal(): void {
    setShowAddRdvModal(false)
  }

  async function addNewRDV(newRDV: RdvFormData): Promise<void> {
    await rendezVousService.postNewRendezVous(idConseiller, newRDV)
    closeAddRdvModal()
    Router.reload()
  }

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
    <>
      <AppHead titre={`Mes jeunes - ${jeune.firstName} ${jeune.lastName}`} />
      <div className='flex flex-col'>
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center'>
            <Link href={'/mes-jeunes'} passHref>
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

          <Button
            onClick={openAddRdvModal}
            label='Créer un rendez-vous'
            style={ButtonColorStyle.WHITE}
          >
            Fixer un rendez-vous
          </Button>
        </div>

        <DetailsJeune jeune={jeune} />

        <div className='mt-8 border-b border-bleu_blanc'>
          <h2 className='h4-semi text-bleu_nuit mb-4'>
            Rendez-vous ({rdvs?.length})
          </h2>

          <ListeRdvJeune
            rdvs={rdvsAVenir}
            onDelete={(rdv: RdvJeune) => {
              setSelectedRdv(rdv)
              setShowDeleteModal(true)
            }}
          />
        </div>

        <div className='mt-8 border-b border-bleu_blanc pb-8'>
          <h2 className='h4-semi text-bleu_nuit mb-4'>Actions</h2>

          <ListeActionsJeune idJeune={jeune.id} />
        </div>

        {showAddRdvModal && (
          <AddRdvModal
            fetchJeunes={() =>
              jeunesService.getJeunesDuConseiller(idConseiller)
            }
            jeuneInitial={jeune}
            addNewRDV={addNewRDV}
            onClose={closeAddRdvModal}
          />
        )}

        {showDeleteModal && selectedRdv && (
          <DeleteRdvModal
            onClose={() => setShowDeleteModal(false)}
            onDelete={deleteRdv}
            show={showDeleteModal}
            rdv={selectedRdv}
          />
        )}
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<FicheJeuneProps> = async (
  context
) => {
  const { user } = (await getSession(context))!

  const [resInfoJeune, resRdvJeune] = await Promise.all([
    fetchJson(`${process.env.API_ENDPOINT}/jeunes/${context.query.jeune_id}/`),
    fetchJson(
      `${process.env.API_ENDPOINT}/jeunes/${context.query.jeune_id}/rendezvous`
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
      idConseiller: user.id,
      jeune: resInfoJeune,
      rdvs: resRdvJeune.filter((rdv: RdvJeune) => new Date(rdv.date) > today),
    },
  }
}

export default FicheJeune

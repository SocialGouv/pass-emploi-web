import { AppHead } from 'components/AppHead'
import Button, { ButtonColorStyle } from 'components/Button'
import { DetailsJeune } from 'components/jeune/DetailsJeune'
import ListeActionsJeune from 'components/jeune/ListeActionsJeune'
import ListeRdvJeune from 'components/jeune/ListeRdvJeune'
import AddRdvModal from 'components/rdv/AddRdvModal'
import DeleteRdvModal from 'components/rdv/DeleteRdvModal'
import { Jeune } from 'interfaces/jeune'
import { RdvFormData } from 'interfaces/json/rdv'
import { RdvJeune } from 'interfaces/rdv'
import { GetServerSideProps } from 'next'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Router from 'next/router'
import React, { useState } from 'react'
import useMatomo from 'utils/analytics/useMatomo'
import { Container, useDIContext } from 'utils/injectionDependances'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import BackIcon from '../../../assets/icons/arrow_back.svg'

interface FicheJeuneProps {
  idConseiller: string
  jeune: Jeune
  rdvs: RdvJeune[]
}

const FicheJeune = ({ idConseiller, jeune, rdvs }: FicheJeuneProps) => {
  const { jeunesService, rendezVousService } = useDIContext()
  const { data: session } = useSession({ required: true })
  const [showAddRdvModal, setShowAddRdvModal] = useState<boolean | undefined>(
    undefined
  )
  const [showDeleteModal, setShowDeleteModal] = useState<boolean | undefined>(
    undefined
  )
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
    await rendezVousService!.postNewRendezVous(
      idConseiller,
      newRDV,
      session!.accessToken
    )
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

  useMatomo(
    showAddRdvModal ? 'Détail jeune - Modale création rdv' : 'Détail jeune'
  )

  useMatomo(
    showDeleteModal
      ? 'Détail jeune - Modale suppression rdv'
      : showDeleteModal === undefined
      ? undefined
      : 'Détail jeune'
  )

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

        {showAddRdvModal && session && (
          <AddRdvModal
            fetchJeunes={() =>
              jeunesService!.getJeunesDuConseiller(
                idConseiller,
                session.accessToken
              )
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
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.hasSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const { jeunesService, rendezVousService } =
    Container.getDIContainer().dependances
  const {
    session: { user, accessToken },
  } = sessionOrRedirect
  const [resInfoJeune, resRdvJeune] = await Promise.all([
    jeunesService.getJeuneDetails(
      context.query.jeune_id as string,
      accessToken
    ),
    rendezVousService.getRendezVousJeune(
      context.query.jeune_id as string,
      accessToken
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

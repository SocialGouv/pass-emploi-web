import { TableauActionsJeune } from 'components/action/TableauActionsJeune'
import { AppHead } from 'components/AppHead'
import { DetailsJeune } from 'components/jeune/DetailsJeune'
import { IntegrationPoleEmploi } from 'components/jeune/IntegrationPoleEmploi'
import ListeRdvJeune from 'components/jeune/ListeRdvJeune'
import DeleteRdvModal from 'components/rdv/DeleteRdvModal'
import SuccessMessage from 'components/SuccessMessage'
import { ActionJeune, compareActionsDatesDesc } from 'interfaces/action'
import { UserStructure } from 'interfaces/conseiller'
import { Jeune } from 'interfaces/jeune'
import { RdvJeune } from 'interfaces/rdv'
import { GetServerSideProps } from 'next'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import styles from 'styles/components/Layouts.module.css'
import linkStyle from 'styles/components/Link.module.css'
import useMatomo from 'utils/analytics/useMatomo'
import { Container } from 'utils/injectionDependances'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import BackIcon from '../../../assets/icons/arrow_back.svg'

interface FicheJeuneProps {
  jeune: Jeune
  rdvs: RdvJeune[]
  actions: ActionJeune[]
  rdvCreationSuccess?: boolean
}

const FicheJeune = ({
  jeune,
  rdvs,
  actions,
  rdvCreationSuccess,
}: FicheJeuneProps) => {
  const { data: session } = useSession({ required: true })
  const router = useRouter()

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [rdvsAVenir, setRdvsAVenir] = useState(rdvs)
  const [selectedRdv, setSelectedRdv] = useState<RdvJeune | undefined>(
    undefined
  )
  const [showRdvCreationSuccess, setShowRdvCreationSuccess] = useState<boolean>(
    rdvCreationSuccess ?? false
  )
  const initialTracking: string = 'Détail jeune'
  const [trackingLabel, setTrackingLabel] = useState<string>(initialTracking)

  const isPoleEmploi = session?.user.structure === UserStructure.POLE_EMPLOI

  function closeRdvCreationMessage(): void {
    setShowRdvCreationSuccess(false)
    router.replace(
      {
        pathname: `/mes-jeunes/${jeune.id}`,
      },
      undefined,
      { shallow: true }
    )
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

  function openDeleteRdvModal(rdv: RdvJeune) {
    setSelectedRdv(rdv)
    setShowDeleteModal(true)
    setTrackingLabel('Détail jeune - Modale suppression rdv')
  }

  function closeDeleteRdvModal() {
    setShowDeleteModal(false)
    setTrackingLabel(initialTracking)
  }

  useMatomo(trackingLabel)

  return (
    <>
      <AppHead titre={`Mes jeunes - ${jeune.firstName} ${jeune.lastName}`} />
      <div className={`flex items-center justify-between ${styles.header}`}>
        <Link href={'/mes-jeunes'}>
          <a className='flex items-center'>
            <BackIcon aria-hidden={true} focusable='false' />
            <span className='ml-6 h4-semi text-bleu_nuit'>
              Liste de mes jeunes
            </span>
          </a>
        </Link>

        {!isPoleEmploi && (
          <Link href={`/mes-jeunes/edition-rdv?from=${router.asPath}`}>
            <a className={`${linkStyle.linkButtonSecondary} text-sm`}>
              Fixer un rendez-vous
            </a>
          </Link>
        )}
      </div>

      <div className={`flex flex-col ${styles.content}`}>
        {showRdvCreationSuccess && (
          <SuccessMessage
            label={'Le rendez-vous a bien été créé'}
            onAcknowledge={closeRdvCreationMessage}
          />
        )}

        <DetailsJeune jeune={jeune} />

        <div className='mt-8 border-b border-bleu_blanc'>
          <h2 className='h4-semi text-bleu_nuit mb-4'>
            Rendez-vous {!isPoleEmploi && `(${rdvs?.length})`}
          </h2>

          {!isPoleEmploi ? (
            <ListeRdvJeune rdvs={rdvsAVenir} onDelete={openDeleteRdvModal} />
          ) : (
            <IntegrationPoleEmploi label='convocations' />
          )}
        </div>

        <div className='mt-8 border-b border-bleu_blanc pb-8'>
          <h2 className='h4-semi text-bleu_nuit mb-4'>Actions</h2>

          {isPoleEmploi && (
            <IntegrationPoleEmploi label='actions et démarches' />
          )}

          {!isPoleEmploi && actions.length !== 0 && (
            <>
              <TableauActionsJeune
                jeune={jeune}
                actions={actions}
                hideTableHead={true}
              />
              <div className='flex justify-center mt-8'>
                <Link href={`/mes-jeunes/${jeune.id}/actions`}>
                  <a className='text-sm text-bleu_nuit underline'>
                    Voir la liste des actions du jeune
                  </a>
                </Link>
              </div>
            </>
          )}

          {!isPoleEmploi && actions.length === 0 && (
            <>
              <p className='text-md text-bleu mb-2'>
                {jeune.firstName} n&apos;a pas encore d&apos;action
              </p>
              <Link href={`/mes-jeunes/${jeune.id}/actions`}>
                <a className='text-sm text-bleu_nuit underline'>
                  Accédez à cette page pour créer une action
                </a>
              </Link>
            </>
          )}
        </div>

        {showDeleteModal && selectedRdv && (
          <DeleteRdvModal
            onClose={closeDeleteRdvModal}
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

  const { jeunesService, rendezVousService, actionsService } =
    Container.getDIContainer().dependances

  const {
    session: { accessToken },
  } = sessionOrRedirect

  const [resInfoJeune, resRdvJeune, resActionsJeune] = await Promise.all([
    jeunesService.getJeuneDetails(
      context.query.jeune_id as string,
      accessToken
    ),
    rendezVousService.getRendezVousJeune(
      context.query.jeune_id as string,
      accessToken
    ),
    actionsService.getActionsJeune(
      context.query.jeune_id as string,
      accessToken
    ),
  ])

  const userActions: ActionJeune[] = [...resActionsJeune]
    .sort(compareActionsDatesDesc)
    .slice(0, 3)

  if (!resInfoJeune || !resRdvJeune) {
    return {
      notFound: true,
    }
  }

  const today = new Date()
  const props: FicheJeuneProps = {
    jeune: resInfoJeune,
    rdvs: resRdvJeune.filter((rdv: RdvJeune) => new Date(rdv.date) > today),
    actions: userActions,
  }
  if (context.query.creationRdv)
    props.rdvCreationSuccess = context.query.creationRdv === 'succes'

  return {
    props,
  }
}

export default FicheJeune

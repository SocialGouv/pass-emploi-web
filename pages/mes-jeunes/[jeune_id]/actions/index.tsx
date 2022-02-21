import AddActionModal from 'components/action/AddActionModal'
import { TableauActionsJeune } from 'components/action/TableauActionsJeune'
import { AppHead } from 'components/AppHead'
import SuccessMessage from 'components/SuccessMessage'
import Button from 'components/ui/Button'
import {
  ActionJeune,
  ActionStatus,
  compareActionsDatesDesc,
} from 'interfaces/action'
import { UserStructure } from 'interfaces/conseiller'
import { Jeune } from 'interfaces/jeune'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import Router, { useRouter } from 'next/router'
import React, { useState } from 'react'
import styles from 'styles/components/Layouts.module.css'
import useMatomo from 'utils/analytics/useMatomo'
import { Container } from 'utils/injectionDependances'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import AddIcon from '../../../../assets/icons/add.svg'
import BackIcon from '../../../../assets/icons/arrow_back.svg'
import FiltresActionsTabList from 'components/action/FiltresActions'

const TOUTES_LES_ACTIONS_LABEL: string = 'toutes'

type Props = {
  jeune: Jeune
  actions: ActionJeune[]
  actionsARealiser: ActionJeune[]
  actionsEnCours: ActionJeune[]
  actionsTerminees: ActionJeune[]
  deleteSuccess: boolean
}

function Actions({
  jeune,
  actions,
  actionsARealiser,
  actionsEnCours,
  actionsTerminees,
  deleteSuccess,
}: Props) {
  const [showModal, setShowModal] = useState<boolean | undefined>(undefined)
  const [showSuccessMessage, setShowSuccessMessage] = useState(deleteSuccess)
  const [actionsFiltrees, setActionsFiltrees] = useState(actions)
  const [currentFilter, setCurrentFilter] = useState<ActionStatus | string>(
    TOUTES_LES_ACTIONS_LABEL
  )
  const initialTracking: string = showSuccessMessage
    ? 'Actions jeune - Succès - Suppression Action'
    : 'Actions jeune'
  const [trackingLabel, setTrackingLabel] = useState<string>(initialTracking)

  const router = useRouter()

  const closeSuccessMessage = () => {
    setShowSuccessMessage(false)
    router.replace(
      {
        pathname: `/mes-jeunes/${jeune.id}/actions`,
      },
      undefined,
      { shallow: true }
    )
  }

  const handleActionsFiltreesClicked = (newFilter: ActionStatus | string) => {
    setCurrentFilter(newFilter)
    if (newFilter === TOUTES_LES_ACTIONS_LABEL) {
      setTrackingLabel('Actions jeune')
      setActionsFiltrees(actions)
    } else if (newFilter === ActionStatus.NotStarted) {
      setTrackingLabel('Actions jeune - Filtre A réaliser')
      setActionsFiltrees(actionsARealiser)
    } else if (newFilter === ActionStatus.InProgress) {
      setTrackingLabel('Actions jeune - Filtre En cours')
      setActionsFiltrees(actionsEnCours)
    } else {
      setTrackingLabel('Actions jeune - Filtre Terminées')
      setActionsFiltrees(actionsTerminees)
    }
  }

  useMatomo(trackingLabel)

  return (
    <>
      <AppHead
        titre={`Mes jeunes - Actions de ${jeune.firstName} ${jeune.lastName}`}
      />
      <div className={`flex justify-between flex-wrap w-full ${styles.header}`}>
        <Link href={`/mes-jeunes/${jeune.id}`}>
          <a className='p-1 mr-[24px]'>
            <BackIcon
              role='img'
              focusable='false'
              aria-label='Retour sur la fiche du jeune'
            />
          </a>
        </Link>

        <div className='flex-auto'>
          <h1 className='h2 text-bleu_nuit mb-5'>
            Les actions de {`${jeune.firstName} ${jeune.lastName}`}
          </h1>
          <p className='text-md text-bleu'>
            Retrouvez le détail des actions de votre bénéficiaire
          </p>
        </div>

        <Button onClick={() => setShowModal(true)}>
          <AddIcon focusable='false' aria-hidden='true' className='mr-2' />
          Créer une nouvelle action
        </Button>
      </div>

      <div className={styles.content}>
        {showModal && (
          <AddActionModal
            onClose={() => {
              setShowModal(false)
              setTrackingLabel('Actions jeune')
            }}
            onAdd={Router.reload}
            show={showModal}
          />
        )}

        {showSuccessMessage && (
          <SuccessMessage
            onAcknowledge={() => closeSuccessMessage()}
            label={"L'action a bien été supprimée"}
          />
        )}

        <FiltresActionsTabList
          currentFilter={currentFilter}
          actionsLength={actions.length}
          actionsARealiserLength={actionsARealiser.length}
          actionsEnCoursLength={actionsEnCours.length}
          actionsTermineesLength={actionsTerminees.length}
          prenomJeune={jeune.firstName}
          filterClicked={(newFilter) => handleActionsFiltreesClicked(newFilter)}
        />

        <div
          role='tabpanel'
          aria-labelledby={`actions-${currentFilter}`}
          tabIndex={0}
          id={`panneau-actions-${currentFilter}`}
          className='mt-8'
        >
          <TableauActionsJeune jeune={jeune} actions={actionsFiltrees} />
        </div>

        {actions.length === 0 && (
          <p className='text-md text-bleu mt-6'>
            {jeune.firstName} n&apos;a pas encore d&apos;action
          </p>
        )}
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
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

  const { actionsService, jeunesService } =
    Container.getDIContainer().dependances
  const [dataDetailsJeune, dataActionsJeune] = await Promise.all([
    jeunesService.getJeuneDetails(
      context.query.jeune_id as string,
      accessToken
    ),
    actionsService.getActionsJeune(
      context.query.jeune_id as string,
      accessToken
    ),
  ])

  if (!dataDetailsJeune || !dataActionsJeune) {
    return {
      notFound: true,
    }
  }

  const sortedActions = [...dataActionsJeune].sort(compareActionsDatesDesc)

  return {
    props: {
      jeune: dataDetailsJeune,
      actions: sortedActions,
      actionsARealiser: sortedActions.filter(
        (action) => action.status === ActionStatus.NotStarted
      ),
      actionsEnCours: sortedActions.filter(
        (action) => action.status === ActionStatus.InProgress
      ),
      actionsTerminees: sortedActions.filter(
        (action) => action.status === ActionStatus.Done
      ),
      deleteSuccess: Boolean(context.query.deleteSuccess),
    },
  }
}

export default Actions

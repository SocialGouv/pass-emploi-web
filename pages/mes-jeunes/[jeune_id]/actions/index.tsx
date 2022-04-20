import { withTransaction } from '@elastic/apm-rum-react'
import AddActionModal from 'components/action/AddActionModal'
import FiltresActionsTabList from 'components/action/FiltresActionsTabList'
import { TableauActionsJeune } from 'components/action/TableauActionsJeune'
import DeprecatedSuccessMessage from 'components/DeprecatedSuccessMessage'
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
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { Container } from 'utils/injectionDependances'
import AddIcon from '../../../../assets/icons/add.svg'
import BackIcon from '../../../../assets/icons/arrow_back.svg'

const TOUTES_LES_ACTIONS_LABEL: string = 'toutes'

type ActionsProps = {
  jeune: Jeune
  actions: ActionJeune[]
  actionsARealiser: ActionJeune[]
  actionsCommencees: ActionJeune[]
  actionsTerminees: ActionJeune[]
  deleteSuccess: boolean
  messageEnvoiGroupeSuccess?: boolean
  pageTitle: string
}

function Actions({
  jeune,
  actions,
  actionsARealiser,
  actionsCommencees,
  actionsTerminees,
  deleteSuccess,
  messageEnvoiGroupeSuccess,
}: ActionsProps) {
  const [showModal, setShowModal] = useState<boolean>(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(deleteSuccess)

  const [showMessageGroupeEnvoiSuccess, setShowMessageGroupeEnvoiSuccess] =
    useState<boolean>(messageEnvoiGroupeSuccess ?? false)

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

  function closeMessageGroupeEnvoiSuccess(): void {
    setShowMessageGroupeEnvoiSuccess(false)
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
      setTrackingLabel('Actions jeune - Filtre Commencées')
      setActionsFiltrees(actionsCommencees)
    } else {
      setTrackingLabel('Actions jeune - Filtre Terminées')
      setActionsFiltrees(actionsTerminees)
    }
  }

  useMatomo(trackingLabel)
  useMatomo(
    showMessageGroupeEnvoiSuccess
      ? `Actions jeune - Succès envoi message`
      : 'Actions jeune'
  )

  return (
    <>
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
          />
        )}
        {showSuccessMessage && (
          <DeprecatedSuccessMessage
            onAcknowledge={() => closeSuccessMessage()}
            label={"L'action a bien été supprimée"}
          />
        )}

        {showMessageGroupeEnvoiSuccess && (
          <SuccessMessage
            label={
              'Votre message multi-destinataires a été envoyé en tant que message individuel à chacun des jeunes'
            }
            onAcknowledge={closeMessageGroupeEnvoiSuccess}
          />
        )}

        <FiltresActionsTabList
          currentFilter={currentFilter}
          actionsLength={actions.length}
          actionsARealiserLength={actionsARealiser.length}
          actionsCommenceesLength={actionsCommencees.length}
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
  if (!sessionOrRedirect.validSession) {
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

  const props: ActionsProps = {
    jeune: dataDetailsJeune,
    actions: sortedActions,
    actionsARealiser: sortedActions.filter(
      (action) => action.status === ActionStatus.NotStarted
    ),
    actionsCommencees: sortedActions.filter(
      (action) => action.status === ActionStatus.InProgress
    ),
    actionsTerminees: sortedActions.filter(
      (action) => action.status === ActionStatus.Done
    ),
    deleteSuccess: Boolean(context.query.deleteSuccess),
    messageEnvoiGroupeSuccess: Boolean(context.query?.envoiMessage),
    pageTitle: `Mes jeunes - Actions de ${dataDetailsJeune.firstName} ${dataDetailsJeune.lastName}`,
  }

  if (context.query?.envoiMessage) {
    props.messageEnvoiGroupeSuccess = context.query.envoiMessage === 'succes'
  }

  return {
    props,
  }
}

export default withTransaction(Actions.name, 'page')(Actions)

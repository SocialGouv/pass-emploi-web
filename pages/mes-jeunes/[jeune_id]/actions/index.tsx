import AddActionModal from 'components/action/AddActionModal'
import { TableauActionsJeune } from 'components/action/TableauActionsJeune'
import { AppHead } from 'components/AppHead'
import SuccessMessage from 'components/SuccessMessage'
import Button from 'components/ui/Button'
import { ActionJeune, compareActionsDatesDesc } from 'interfaces/action'
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

type Props = {
  jeune: Jeune
  actions: ActionJeune[]
  actionsARealiser: ActionJeune[]
  actionsCommencees: ActionJeune[]
  actionsTerminees: ActionJeune[]
  deleteSuccess: boolean
}

function Actions({
  jeune,
  actions,
  actionsARealiser,
  actionsCommencees,
  actionsTerminees,
  deleteSuccess,
}: Props) {
  const [showModal, setShowModal] = useState<boolean | undefined>(undefined)
  const [showSuccessMessage, setShowSuccessMessage] = useState(deleteSuccess)
  const [actionsFiltrees, setActionsFiltrees] = useState(actions)
  const [currentFilter, setCurrentFilter] = useState<ActionStatus | 'Toutes'>(
    'Toutes'
  )
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

  useMatomo(
    showSuccessMessage
      ? 'Actions jeune - Succès - Suppression Action'
      : 'Actions jeune'
  )

  useMatomo(showModal === false ? 'Actions jeune' : undefined)

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
            onClose={() => setShowModal(false)}
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
      </div>

      <div role='tablist' className='flex'>
        <Button
          role='tab'
          id='onglet-1'
          tabIndex={currentFilter === 'Toutes' ? 0 : -1}
          selected={currentFilter === 'Toutes'}
          aria-controls='panneau-1'
          className='mr-4'
          style={ButtonStyle.SECONDARY}
          onClick={() => {
            setCurrentFilter('Toutes')
            setActionsFiltrees(actions)
          }}
        >
          Toutes ({actions.length})
        </Button>
        <Button
          role='tab'
          id='onglet-2'
          tabIndex={currentFilter === ActionStatus.NotStarted ? 0 : -1}
          selected={currentFilter === ActionStatus.NotStarted}
          aria-controls='panneau-2'
          className='mr-4'
          style={ButtonStyle.SECONDARY}
          onClick={() => {
            setCurrentFilter(ActionStatus.NotStarted)
            setActionsFiltrees(actionsARealiser)
          }}
        >
          À réaliser ({actionsARealiser.length})
        </Button>

        <Button
          role='tab'
          id='onglet-3'
          tabIndex={currentFilter === ActionStatus.InProgress ? 0 : -1}
          selected={currentFilter === ActionStatus.InProgress}
          aria-controls='panneau-3'
          className='mr-4'
          style={ButtonStyle.SECONDARY}
          onClick={() => {
            setCurrentFilter(ActionStatus.InProgress)
            setActionsFiltrees(actionsCommencees)
          }}
        >
          Commencées ({actionsCommencees.length})
        </Button>

        <Button
          role='tab'
          id='onglet-4'
          tabIndex={currentFilter === ActionStatus.Done ? 0 : -1}
          selected={currentFilter === ActionStatus.Done}
          aria-controls='panneau-4'
          className='mr-4'
          style={ButtonStyle.SECONDARY}
          onClick={() => {
            setCurrentFilter(ActionStatus.Done)
            setActionsFiltrees(actionsTerminees)
          }}
        >
          Terminées ({actionsTerminees.length})
        </Button>
      </div>

      {actionsFiltrees.length != 0 && (
        <TableauActionsJeune jeune={jeune} actions={actionsFiltrees} />
      )}
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
      actionsCommencees: sortedActions.filter(
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

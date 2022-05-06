import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

import AddIcon from '../../../../assets/icons/add.svg'
import BackIcon from '../../../../assets/icons/arrow_back.svg'

import FiltresActionsTabList, {
  LABELS_FILTRES,
  TOUTES_LES_ACTIONS_LABEL,
} from 'components/action/FiltresActionsTabList'
import { TableauActionsJeune } from 'components/action/TableauActionsJeune'
import SuccessMessage from 'components/SuccessMessage'
import ButtonLink from 'components/ui/ButtonLink'
import {
  Action,
  ActionsParStatut,
  compareActionsDatesDesc,
  NombreActionsParStatut,
  StatutAction,
} from 'interfaces/action'
import { UserStructure } from 'interfaces/conseiller'
import { Jeune } from 'interfaces/jeune'
import { ActionsService } from 'services/actions.service'
import { JeunesService } from 'services/jeunes.service'
import styles from 'styles/components/Layouts.module.css'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

interface ActionsProps {
  jeune: Jeune
  actions: Action[]
  pageTitle: string
  creationSuccess?: boolean
  suppressionSuccess?: boolean
  messageEnvoiGroupeSuccess?: boolean
}

function Actions({
  jeune,
  actions,
  creationSuccess,
  suppressionSuccess,
  messageEnvoiGroupeSuccess,
}: ActionsProps) {
  const router = useRouter()
  const [showCreationSuccess, setShowCreationSuccess] = useState<boolean>(
    creationSuccess ?? false
  )
  const [showSuppressionSuccess, setShowSuppressionSuccess] = useState<boolean>(
    suppressionSuccess ?? false
  )
  const [showMessageGroupeEnvoiSuccess, setShowMessageGroupeEnvoiSuccess] =
    useState<boolean>(messageEnvoiGroupeSuccess ?? false)
  const [actionsParStatut, setActionsParStatut] = useState<ActionsParStatut>(
    sortActionsParStatut([])
  )
  const [actionsFiltrees, setActionsFiltrees] = useState(actions)
  const [currentFilter, setCurrentFilter] = useState<StatutAction | string>(
    TOUTES_LES_ACTIONS_LABEL
  )

  const pageTracking = 'Actions jeune'
  let initialTracking = pageTracking
  if (creationSuccess) initialTracking += ' - Succès - Creation Action'
  if (suppressionSuccess) initialTracking += ' - Succès - Suppression Action'
  if (messageEnvoiGroupeSuccess) initialTracking += ' -  Succès envoi message'
  const [trackingLabel, setTrackingLabel] = useState<string>(initialTracking)

  async function closeCreationSuccessMessage() {
    setShowCreationSuccess(false)
    await router.replace(
      {
        pathname: `/mes-jeunes/${jeune.id}/actions`,
      },
      undefined,
      { shallow: true }
    )
  }

  async function closeSuppressionSuccessMessage() {
    setShowSuppressionSuccess(false)
    await router.replace(
      {
        pathname: `/mes-jeunes/${jeune.id}/actions`,
      },
      undefined,
      { shallow: true }
    )
  }

  async function closeMessageGroupeEnvoiSuccess() {
    setShowMessageGroupeEnvoiSuccess(false)
    await router.replace(
      {
        pathname: `/mes-jeunes/${jeune.id}/actions`,
      },
      undefined,
      { shallow: true }
    )
  }

  const handleActionsFiltreesClicked = (newFilter: StatutAction | string) => {
    setCurrentFilter(newFilter)
    if (newFilter === TOUTES_LES_ACTIONS_LABEL) {
      setTrackingLabel(pageTracking)
      setActionsFiltrees(actions)
    } else {
      const statut = newFilter as StatutAction
      setTrackingLabel(`Actions jeune - Filtre ${LABELS_FILTRES[statut]}`)
      setActionsFiltrees(actionsParStatut[statut])
    }
  }

  function sortActionsParStatut(actionsATrier: Action[]): ActionsParStatut {
    return Object.values(StatutAction).reduce((parStatut, statut) => {
      parStatut[statut] = actionsATrier.filter(
        (action) => action.status === statut
      )
      return parStatut
    }, {} as ActionsParStatut)
  }

  function getNombreActionsParStatut(): NombreActionsParStatut {
    return Object.values(StatutAction).reduce((parStatut, statut) => {
      parStatut[statut] = actionsParStatut[statut].length
      return parStatut
    }, {} as { [key in StatutAction]: number })
  }

  useMatomo(trackingLabel)

  useEffect(() => {
    setActionsParStatut(sortActionsParStatut(actions))
  }, [actions])

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
          <h1 className='h2 text-primary mb-5'>
            Les actions de {`${jeune.firstName} ${jeune.lastName}`}
          </h1>
          <p className='text-md'>
            Retrouvez le détail des actions de votre bénéficiaire
          </p>
        </div>

        <ButtonLink href={`/mes-jeunes/${jeune.id}/actions/nouvelle-action`}>
          <AddIcon focusable='false' aria-hidden='true' className='mr-2' />
          Créer une nouvelle action
        </ButtonLink>
      </div>

      <div className={styles.content}>
        {showCreationSuccess && (
          <SuccessMessage
            label={"L'action a bien été créée"}
            onAcknowledge={closeCreationSuccessMessage}
          />
        )}

        {showSuppressionSuccess && (
          <SuccessMessage
            label={"L'action a bien été supprimée"}
            onAcknowledge={closeSuppressionSuccessMessage}
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
          actionsCount={actions.length}
          actionsCountParStatut={getNombreActionsParStatut()}
          prenomJeune={jeune.firstName}
          controlledIdPrefix='panneau-actions'
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
          <p className='text-m text-primary mt-6'>
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

  const jeunesService = withDependance<JeunesService>('jeunesService')
  const actionsService = withDependance<ActionsService>('actionsService')
  const [jeune, actions] = await Promise.all([
    jeunesService.getJeuneDetails(
      context.query.jeune_id as string,
      accessToken
    ),
    actionsService.getActionsJeune(
      context.query.jeune_id as string,
      accessToken
    ),
  ])

  if (!jeune) {
    return {
      notFound: true,
    }
  }
  const props: ActionsProps = {
    jeune: jeune,
    actions: [...actions].sort(compareActionsDatesDesc),
    pageTitle: `Mes jeunes - Actions de ${jeune.firstName} ${jeune.lastName}`,
  }

  if (context.query?.creation) {
    props.creationSuccess = context.query.creation === 'succes'
  }
  if (context.query?.suppression) {
    props.suppressionSuccess = context.query.suppression === 'succes'
  }
  if (context.query?.envoiMessage) {
    props.messageEnvoiGroupeSuccess = context.query.envoiMessage === 'succes'
  }

  return {
    props,
  }
}

export default withTransaction(Actions.name, 'page')(Actions)

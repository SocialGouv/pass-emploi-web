import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import InfoAction from 'components/action/InfoAction'
import { RadioButtonStatus } from 'components/action/RadioButtonStatus'
import FailureMessage from 'components/FailureMessage'
import Button, { ButtonStyle } from 'components/ui/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Action, StatutAction } from 'interfaces/action'
import { StructureConseiller, UserType } from 'interfaces/conseiller'
import { BaseJeune } from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import { ActionsService } from 'services/actions.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { formatDayDate } from 'utils/date'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

interface PageActionProps extends PageProps {
  action: Action
  jeune: BaseJeune
  messageEnvoiGroupeSuccess?: boolean
  pageTitle: string
}

function PageAction({
  action,
  jeune,
  messageEnvoiGroupeSuccess,
}: PageActionProps) {
  const actionsService = useDependance<ActionsService>('actionsService')
  const router = useRouter()
  const [statut, setStatut] = useState<StatutAction>(action.status)
  const [deleteDisabled, setDeleteDisabled] = useState<boolean>(false)
  const [showEchecMessage, setShowEchecMessage] = useState<boolean>(false)
  const pageTracking = 'Détail Action'

  async function updateAction(statutChoisi: StatutAction): Promise<void> {
    const nouveauStatut = await actionsService.updateAction(
      action.id,
      statutChoisi
    )
    setStatut(nouveauStatut)
  }

  async function deleteAction(): Promise<void> {
    setDeleteDisabled(true)
    actionsService
      .deleteAction(action.id)
      .then(() => {
        router.push({
          pathname: `/mes-jeunes/${jeune.id}/actions`,
          query: { [QueryParam.suppressionAction]: QueryValue.succes },
        })
      })
      .catch((error: Error) => {
        setShowEchecMessage(true)
        console.log('Erreur lors de la suppression de l action', error)
      })
      .finally(() => {
        setDeleteDisabled(false)
      })
  }

  useMatomo(
    messageEnvoiGroupeSuccess
      ? `${pageTracking} - Succès envoi message`
      : pageTracking
  )

  return (
    <>
      {showEchecMessage && (
        <FailureMessage
          label="Une erreur s'est produite lors de la suppression de l'action, veuillez réessayer ultérieurement"
          onAcknowledge={() => setShowEchecMessage(false)}
        />
      )}
      <div className='flex flex-col items-end'>
        {action.creatorType === UserType.CONSEILLER.toLowerCase() && (
          <Button
            label="Supprimer l'action"
            onClick={() => deleteAction()}
            style={ButtonStyle.SECONDARY}
            disabled={deleteDisabled}
          >
            <IconComponent
              name={IconName.TrashCan}
              aria-hidden={true}
              focusable={false}
              className='w-2.5 h-3 mr-4'
            />
            Supprimer l’action
          </Button>
        )}
      </div>
      <dl>
        <p className='mb-5'>
          À réaliser pour le : {formatDayDate(new Date(action.dateEcheance))}
        </p>
        <InfoAction label='Statut' isForm={true}>
          {Object.values(StatutAction).map((status: StatutAction) => (
            <RadioButtonStatus
              key={status.toLowerCase()}
              status={status}
              isSelected={statut === status}
              onChange={updateAction}
            />
          ))}
        </InfoAction>

        <InfoAction label='Intitulé de l’action'>{action.content}</InfoAction>
        {action.comment && (
          <InfoAction label='Commentaire à destination du jeune'>
            <span className='inline-block bg-primary_lighten p-4 rounded-large'>
              {action.comment}
            </span>
          </InfoAction>
        )}
      </dl>
      <dl className='grid grid-cols-[auto_1fr] grid-rows-[repeat(4,_auto)]'>
        <InfoAction label='Date d’actualisation' isInline={true}>
          {formatDayDate(new Date(action.lastUpdate))}
        </InfoAction>
        <InfoAction label='Date de création' isInline={true}>
          {formatDayDate(new Date(action.creationDate))}
        </InfoAction>
        <InfoAction label='Créateur' isInline={true}>
          {action.creator}
        </InfoAction>
      </dl>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<PageActionProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user, accessToken },
  } = sessionOrRedirect
  if (user.structure === StructureConseiller.POLE_EMPLOI) {
    return { notFound: true }
  }

  const actionsService = withDependance<ActionsService>('actionsService')
  const actionEtJeune = await actionsService.getAction(
    context.query.action_id as string,
    accessToken
  )
  if (!actionEtJeune) return { notFound: true }

  const { action, jeune } = actionEtJeune
  const props: PageActionProps = {
    action,
    jeune,
    pageTitle: `Mes jeunes - Actions de ${jeune.prenom} ${jeune.nom} - ${action.content}`,
    pageHeader: 'Détails de l’action',
  }

  if (context.query[QueryParam.envoiMessage]) {
    props.messageEnvoiGroupeSuccess =
      context.query[QueryParam.envoiMessage] === QueryValue.succes
  }

  return { props }
}

export default withTransaction(PageAction.name, 'page')(PageAction)

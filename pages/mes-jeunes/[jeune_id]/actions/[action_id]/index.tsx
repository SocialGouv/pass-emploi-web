import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import InfoAction from 'components/action/InfoAction'
import { RadioButtonStatus } from 'components/action/RadioButtonStatus'
import EchecMessage from 'components/EchecMessage'
import SuccessMessage from 'components/SuccessMessage'
import Button, { ButtonStyle } from 'components/ui/Button'
import { Action, StatutAction } from 'interfaces/action'
import { UserStructure } from 'interfaces/conseiller'
import { Jeune } from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { ActionsService } from 'services/actions.service'
import useMatomo from 'utils/analytics/useMatomo'
import useSession from 'utils/auth/useSession'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { formatDayDate } from 'utils/date'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

interface PageActionProps extends PageProps {
  action: Action
  jeune: Jeune
  messageEnvoiGroupeSuccess?: boolean
  pageTitle: string
}

function PageAction({
  action,
  jeune,
  messageEnvoiGroupeSuccess,
}: PageActionProps) {
  const actionsService = useDependance<ActionsService>('actionsService')
  const { data: session } = useSession<true>({ required: true })
  const router = useRouter()
  const [statut, setStatut] = useState<StatutAction>(action.status)
  const [deleteDisabled, setDeleteDisabled] = useState<boolean>(false)
  const [showEchecMessage, setShowEchecMessage] = useState<boolean>(false)

  const [showMessageGroupeEnvoiSuccess, setShowMessageGroupeEnvoiSuccess] =
    useState<boolean>(messageEnvoiGroupeSuccess ?? false)

  const pageTracking = 'Détail Action'

  async function updateAction(statutChoisi: StatutAction): Promise<void> {
    const nouveauStatut = await actionsService.updateAction(
      action.id,
      statutChoisi,
      session!.accessToken
    )
    setStatut(nouveauStatut)
  }

  async function deleteAction(): Promise<void> {
    setDeleteDisabled(true)
    actionsService
      .deleteAction(action.id, session!.accessToken)
      .then(() => {
        router.push({
          pathname: `/mes-jeunes/${jeune.id}/actions`,
          query: { suppression: 'succes' },
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

  function closeMessageGroupeEnvoiSuccess(): void {
    setShowMessageGroupeEnvoiSuccess(false)
    router.replace(
      {
        pathname: `/mes-jeunes/${jeune.id}/actions/${action.id}`,
      },
      undefined,
      { shallow: true }
    )
  }

  useMatomo(
    showMessageGroupeEnvoiSuccess
      ? `${pageTracking} - Succès envoi message`
      : pageTracking
  )

  return (
    <>
      {action.creatorType === 'conseiller' && (
        <Button
          label="Supprimer l'action"
          onClick={() => deleteAction()}
          style={ButtonStyle.WARNING}
          disabled={deleteDisabled}
          className='mb-4'
        >
          Supprimer l&apos;action
        </Button>
      )}

      {showEchecMessage && (
        <EchecMessage
          label={
            "Une erreur s'est produite lors de la suppression de l'action, veuillez réessayer ultérieurement"
          }
          onAcknowledge={() => setShowEchecMessage(false)}
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

      <dl>
        {action.comment && (
          <>
            <dt className='text-sm-semi'>Commentaire</dt>
            <dd className='mt-4 text-primary_darken text-base-regular'>
              {action.comment}
            </dd>
          </>
        )}

        <dt className={`text-sm-semi ${action.comment ? 'mt-8' : ''}`}>
          Informations
        </dt>
        <dd>
          <dl className='grid grid-cols-[auto_1fr] grid-rows-[repeat(4,_auto)]'>
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

            <InfoAction label="Date d'actualisation">
              {formatDayDate(new Date(action.lastUpdate))}
            </InfoAction>

            <InfoAction label='Date de création'>
              {formatDayDate(new Date(action.creationDate))}
            </InfoAction>

            <InfoAction label='Créateur'>{action.creator}</InfoAction>
          </dl>
        </dd>
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
  if (user.structure === UserStructure.POLE_EMPLOI) {
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
    pageTitle: `Mes jeunes - Actions de ${jeune.firstName} ${jeune.lastName} - ${action.content}`,
    pageHeader: action.content,
  }

  if (context.query?.envoiMessage) {
    props.messageEnvoiGroupeSuccess = context.query.envoiMessage === 'succes'
  }

  return { props }
}

export default withTransaction(PageAction.name, 'page')(PageAction)

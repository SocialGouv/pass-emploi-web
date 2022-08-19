import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import { CommentairesAction } from 'components/action/CommentairesAction'
import { HistoriqueAction } from 'components/action/HistoriqueAction'
import RadioButtonStatus from 'components/action/RadioButtonStatus'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import { Action, Commentaire, StatutAction } from 'interfaces/action'
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
  commentaires: Commentaire[]
  messageEnvoiGroupeSuccess?: boolean
  pageTitle: string
}

function PageAction({
  action,
  jeune,
  commentaires,
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
          pathname: `/mes-jeunes/${jeune.id}`,
          query: {
            [QueryParam.suppressionAction]: QueryValue.succes,
            onglet: 'actions',
          },
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

  function onAjoutCommentaire(estEnSucces: boolean) {
    if (!estEnSucces) {
      setShowEchecMessage(true)
    } else {
      router.push({
        pathname: `/mes-jeunes/${jeune.id}/actions/${action.id}`,
        query: {
          [QueryParam.ajoutCommentaireAction]: QueryValue.succes,
        },
      })
    }
  }

  useMatomo(
    messageEnvoiGroupeSuccess
      ? `${pageTracking} - Succès envoi message`
      : pageTracking
  )

  return (
    <>
      {showEchecMessage && (
        <FailureAlert
          label="Une erreur s'est produite, veuillez réessayer ultérieurement"
          onAcknowledge={() => setShowEchecMessage(false)}
        />
      )}
      <div className='flex items-start justify-between mb-5'>
        <h2
          className='text-m-bold text-content_color'
          title='Intitulé de l’action'
        >
          {action.content}
        </h2>
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
            Supprimer
          </Button>
        )}
      </div>
      {action.comment && <p className='mb-8'>{action.comment}</p>}
      <div className='flex flex-raw items-center justify-between mb-8 bg-accent_3_lighten rounded-medium'>
        <span className='flex flex-row p-2 text-accent_2'>
          <IconComponent
            name={IconName.Clock}
            aria-hidden='true'
            focusable='false'
            className='h-5 w-5 mr-1 stroke-accent_2'
          />
          <span>
            À réaliser pour le :{' '}
            <b>{formatDayDate(new Date(action.dateEcheance))}</b>
          </span>
        </span>
      </div>
      <h2 className='text-m-bold pb-6'>Statut</h2>
      <form className='flex flex-raw mb-10'>
        {Object.values(StatutAction).map((status: StatutAction) => (
          <RadioButtonStatus
            key={status.toLowerCase()}
            status={status}
            isSelected={statut === status}
            onChange={updateAction}
          />
        ))}
      </form>
      <HistoriqueAction action={action} />
      <CommentairesAction
        idAction={action.id}
        commentairesInitiaux={commentaires}
        onAjout={onAjoutCommentaire}
      />
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

  const commentaires = await actionsService.recupererLesCommentaires(
    context.query.action_id as string,
    accessToken
  )
  if (!commentaires) return { notFound: true }

  const { action, jeune } = actionEtJeune
  const props: PageActionProps = {
    action,
    jeune,
    commentaires,
    pageTitle: `Portefeuille - Actions de ${jeune.prenom} ${jeune.nom} - ${action.content}`,
    pageHeader: 'Détails de l’action',
  }

  if (context.query[QueryParam.envoiMessage]) {
    props.messageEnvoiGroupeSuccess =
      context.query[QueryParam.envoiMessage] === QueryValue.succes
  }

  return { props }
}

export default withTransaction(PageAction.name, 'page')(PageAction)

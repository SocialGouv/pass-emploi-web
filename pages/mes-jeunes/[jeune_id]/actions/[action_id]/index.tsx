import { withTransaction } from '@elastic/apm-rum-react'
import InfoAction from 'components/action/InfoAction'
import { RadioButtonStatus } from 'components/action/RadioButtonStatus'
import { AppHead } from 'components/AppHead'
import EchecMessage from 'components/EchecMessage'
import SuccessMessage from 'components/SuccessMessage'
import Button, { ButtonStyle } from 'components/ui/Button'
import { ActionJeune, ActionStatus } from 'interfaces/action'
import { UserStructure } from 'interfaces/conseiller'
import { Jeune } from 'interfaces/jeune'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { ActionsService } from 'services/actions.service'
import styles from 'styles/components/Layouts.module.css'
import useMatomo from 'utils/analytics/useMatomo'
import useSession from 'utils/auth/useSession'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { formatDayDate } from 'utils/date'
import { Container, useDependance } from 'utils/injectionDependances'
import BackIcon from '../../../../../assets/icons/arrow_back.svg'

type PageActionProps = {
  action: ActionJeune
  jeune: Jeune
  messageEnvoiGroupeSuccess?: boolean
}

function PageAction({
  action,
  jeune,
  messageEnvoiGroupeSuccess,
}: PageActionProps) {
  const actionsService = useDependance<ActionsService>('actionsService')
  const { data: session } = useSession<true>({ required: true })
  const router = useRouter()
  const [statut, setStatut] = useState<ActionStatus>(action.status)
  const [deleteDisabled, setDeleteDisabled] = useState<boolean>(false)
  const [showEchecMessage, setShowEchecMessage] = useState<boolean>(false)

  const [showMessageGroupeEnvoiSuccess, setShowMessageGroupeEnvoiSuccess] =
    useState<boolean>(messageEnvoiGroupeSuccess ?? false)

  const pageTracking = 'Détail Action'

  async function updateAction(statutChoisi: ActionStatus): Promise<void> {
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
          query: { deleteSuccess: true },
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
      <AppHead
        titre={`Mes jeunes - Actions de ${jeune.firstName} ${jeune.lastName} - ${action.content} `}
      />
      <div className={`flex justify-between ${styles.header}`}>
        <Link href={`/mes-jeunes/${jeune.id}/actions`}>
          <a className='flex items-center'>
            <BackIcon focusable='false' aria-hidden={true} />
            <span className='ml-6 h4-semi text-bleu_nuit'>
              Actions de {jeune.firstName} {jeune.lastName}
            </span>
          </a>
        </Link>

        {action.creatorType === 'conseiller' && (
          <Button
            label="Supprimer l'action"
            onClick={() => deleteAction()}
            style={ButtonStyle.WARNING}
            className='px-[36px] py-[16px]'
            disabled={deleteDisabled}
          >
            Supprimer l&apos;action
          </Button>
        )}
      </div>

      <div className={styles.content}>
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
          <dt className='text-bleu text-sm-semi'>Intitulé de l&apos;action</dt>
          <dd className='mt-4 text-bleu_nuit text-md-semi'>{action.content}</dd>

          {action.comment && (
            <>
              <dt className='mt-8 text-bleu text-sm-semi'>Commentaire</dt>
              <dd className='mt-4 text-bleu_nuit text-base-regular'>
                {action.comment}
              </dd>
            </>
          )}

          <dt className='mt-8 text-bleu text-sm-semi'>Informations</dt>
          <dd>
            <dl className='grid grid-cols-[auto_1fr] grid-rows-[repeat(4,_auto)]'>
              <InfoAction label='Statut' isForm={true}>
                <RadioButtonStatus
                  status={ActionStatus.NotStarted}
                  isSelected={statut === ActionStatus.NotStarted}
                  onChange={updateAction}
                />
                <RadioButtonStatus
                  status={ActionStatus.InProgress}
                  isSelected={statut === ActionStatus.InProgress}
                  onChange={updateAction}
                />
                <RadioButtonStatus
                  status={ActionStatus.Done}
                  isSelected={statut === ActionStatus.Done}
                  onChange={updateAction}
                />
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
      </div>
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

  const { actionsService } = Container.getDIContainer().dependances
  const res = await actionsService.getAction(
    context.query.action_id as string,
    accessToken
  )

  const props: PageActionProps = {
    action: res,
    jeune: res.jeune,
    messageEnvoiGroupeSuccess: Boolean(context.query?.envoiMessage),
  }

  if (context.query?.envoiMessage) {
    props.messageEnvoiGroupeSuccess = context.query.envoiMessage === 'succes'
  }

  return {
    props,
  }
}

export default withTransaction(PageAction.name, 'page')(PageAction)

import { RadioButtonStatus } from 'components/action/RadioButtonStatus'
import { AppHead } from 'components/AppHead'
import Button, { ButtonColorStyle } from 'components/Button'
import EchecMessage from 'components/EchecMessage'
import { ActionJeune, ActionStatus } from 'interfaces/action'
import { UserStructure } from 'interfaces/conseiller'
import { Jeune } from 'interfaces/jeune'
import { GetServerSideProps } from 'next'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { ActionsService } from 'services/actions.service'
import useMatomo from 'utils/analytics/useMatomo'
import { formatDayDate } from 'utils/date'
import { Container, useDependance } from 'utils/injectionDependances'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import BackIcon from '../../../../../assets/icons/arrow_back.svg'

type Props = {
  action: ActionJeune
  jeune: Jeune
}

function PageAction({ action, jeune }: Props) {
  const actionsService = useDependance<ActionsService>('actionsService')
  const { data: session } = useSession({ required: true })
  const router = useRouter()
  const [statutChoisi, setStatutChoisi] = useState<ActionStatus>(action.status)
  const [deleteDisabled, setDeleteDisabled] = useState<boolean>(false)
  const [showEchecMessage, setShowEchecMessage] = useState<boolean>(false)

  async function updateAction(statutChoisi: ActionStatus): Promise<void> {
    const nouveauStatut = await actionsService.updateAction(
      action.id,
      statutChoisi,
      session!.accessToken
    )
    setStatutChoisi(nouveauStatut)
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

  useMatomo('Détail action')

  return (
    <>
      <AppHead
        titre={`Mes jeunes - Actions de ${jeune.firstName} ${jeune.lastName} - ${action.content} `}
      />
      <div className='flex justify-between mb-[63px]'>
        <div className='flex items-center'>
          <Link href={`/mes-jeunes/${jeune.id}/actions`} passHref>
            <a
              className='mr-[24px]'
              aria-label="Retour sur la liste d'actions du jeune"
            >
              <BackIcon role='img' focusable='false' />
            </a>
          </Link>
          <p className='h4-semi text-bleu_nuit'>
            Actions de {jeune.firstName} {jeune.lastName}
          </p>
        </div>

        {action.creatorType === 'conseiller' && (
          <Button
            label="Supprimer l'action"
            onClick={() => deleteAction()}
            style={ButtonColorStyle.RED}
            className='px-[36px] py-[16px]'
            disabled={deleteDisabled}
          >
            Supprimer l&apos;action
          </Button>
        )}
      </div>

      {showEchecMessage && (
        <EchecMessage
          label={
            "Une erreur s'est produite lors de la suppression de l'action, veuillez réessayer ultérieurement"
          }
          onAcknowledge={() => setShowEchecMessage(false)}
        />
      )}

      <h1 className='h3-semi text-bleu_nuit mb-[24px]'>{action.content}</h1>
      <p className='text-sm text-bleu mb-[24px]'>{action.comment}</p>
      <div className='border-t-2 border-b-2 border-bleu_blanc flex justify-between items-center py-[14px]'>
        <dl className='flex py-[26px]'>
          <dt className='text-bleu text-sm mr-[25px]'>Date</dt>
          <dd className='text-bleu_nuit text-sm'>
            {formatDayDate(new Date(action.creationDate))}
          </dd>
        </dl>

        <div className='border-r-2 border-bleu_blanc' />

        <form onSubmit={(e) => e.preventDefault()}>
          <fieldset className='border-none'>
            <span className='flex items-center text-sm'>
              <legend className='text-bleu inline mr-[25px]'>Statut</legend>
              <RadioButtonStatus
                status='À réaliser'
                isSelected={statutChoisi === ActionStatus.NotStarted}
                onChange={() => updateAction(ActionStatus.NotStarted)}
              />
              <RadioButtonStatus
                status='En cours'
                isSelected={statutChoisi === ActionStatus.InProgress}
                onChange={() => updateAction(ActionStatus.InProgress)}
              />
              <RadioButtonStatus
                status='Terminée'
                isSelected={statutChoisi === ActionStatus.Done}
                onChange={() => updateAction(ActionStatus.Done)}
              />
            </span>
          </fieldset>
        </form>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
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

  const { actionsService } = Container.getDIContainer().dependances
  const res = await actionsService.getAction(
    context.query.action_id as string,
    accessToken
  )

  return {
    props: {
      action: res,
      jeune: res.jeune,
    },
  }
}

export default PageAction

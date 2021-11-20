import { RadioButtonStatus } from 'components/action/RadioButtonStatus'
import { Jeune } from 'interfaces'
import { ActionJeune, ActionStatus } from 'interfaces/action'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { formatDayDate } from 'utils/date'
import fetchJson from 'utils/fetchJson'
import { useDIContext } from 'utils/injectionDependances'
import BackIcon from '../../../../../assets/icons/arrow_back.svg'
import Button, { ButtonColorStyle } from '../../../../../components/Button'
import { ActionsService } from '../../../../../services/actions.service'

type Props = {
  action: ActionJeune
  jeune: Jeune
}

function PageAction ({ action, jeune }: Props) {
  const [statutChoisi, setStatutChoisi] = useState<ActionStatus>(action.status)
  const router = useRouter()
  const actionsService: ActionsService = useDIContext().get('ActionsService')

  async function updateAction (statutChoisi: ActionStatus): Promise<void> {
    const nouveauStatut = await actionsService.updateAction(action.id, statutChoisi)
    setStatutChoisi(nouveauStatut)
  }

  async function deleteAction (): Promise<void> {
    await actionsService.deleteAction(action.id)
    router.push(`/mes-jeunes/${jeune.id}/actions`)
  }

  return (
    <>
      <div className='flex justify-between mb-[63px]'>
        <div className='flex items-center'>
          <Link href={`/mes-jeunes/${jeune.id}/actions`} passHref>
            <a
              className='mr-[24px]'
              aria-label="Retour sur la liste d'actions du jeune"
            >
              <BackIcon role='img' focusable='false'/>
            </a>
          </Link>
          <p className='h4-semi text-bleu_nuit'>
            Actions de {jeune.firstName} {jeune.lastName}
          </p>
        </div>

        {
          action.creatorType === 'conseiller' && (
            <Button
              label="Supprimer l'action"
              onClick={() => deleteAction()}
              style={ButtonColorStyle.RED}
              className='px-[36px] py-[16px]'
            >
              Supprimer l&apos;action
            </Button>
          )
        }
      </div>

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
          <fieldset>
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

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  const res = await fetchJson(
    `${process.env.API_ENDPOINT}/actions/${query.action_id}`
  )

  return {
    props: {
      action: res,
      jeune: res.jeune
    }
  }
}

export default PageAction

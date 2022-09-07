import Link from 'next/link'
import React, { useMemo } from 'react'

import StatusTag from 'components/action/StatusTag'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import RowCell from 'components/ui/Table/RowCell'
import { Action, StatutAction } from 'interfaces/action'
import { formatDayDate } from 'utils/date'

interface ActionRowProps {
  action: Action
  jeuneId: string
}

export default function ActionRow({ action, jeuneId }: ActionRowProps) {
  const actionEstEnRetard = useMemo(() => {
    return (
      action.status !== StatutAction.Annulee &&
      action.status !== StatutAction.Terminee &&
      new Date(action.dateEcheance).getTime() < new Date().getTime()
    )
  }, [action])

  return (
    <Link href={`/mes-jeunes/${jeuneId}/actions/${action.id}`}>
      <a
        role='row'
        aria-label={`Détail de l'action ${action.content}`}
        className={`table-row cursor-pointer focus-within:primary_lighten rounded-small shadow-s hover:bg-primary_lighten`}
      >
        <RowCell className='rounded-l-small'>
          <span className='flex items-center'>
            <span className='text-base-bold text-ellipsis overflow-hidden max-w-[400px] whitespace-nowrap'>
              {action.content}
            </span>
          </span>
        </RowCell>
        <RowCell>
          <span className='flex items-center'>
            <span>{formatDayDate(new Date(action.creationDate))}</span>
          </span>
        </RowCell>
        <RowCell>
          <span className='flex flex-row items-center'>
            <span
              className={
                actionEstEnRetard
                  ? 'text-warning flex flex-row items-center'
                  : ''
              }
            >
              {actionEstEnRetard ? (
                <IconComponent
                  name={IconName.ImportantOutline}
                  aria-label='en retard'
                  aria-hidden='true'
                  focusable='false'
                  className='h-3 mr-1'
                />
              ) : (
                <></>
              )}
              {formatDayDate(new Date(action.dateEcheance))}
            </span>
          </span>
        </RowCell>
        <RowCell className='rounded-r-small w-[160px]'>
          <span className='flex items-center justify-between'>
            <StatusTag status={action.status} />
            <IconComponent
              name={IconName.ChevronRight}
              focusable='false'
              aria-hidden='true'
              className=' w-6 h-6 fill-content_color'
            />
          </span>
        </RowCell>
      </a>
    </Link>
  )
}

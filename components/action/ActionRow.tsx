import Link from 'next/link'
import React from 'react'

import NoteIcon from '../../assets/icons/note_outline.svg'
import IconComponent, { IconName } from '../ui/IconComponent'

import StatusTag from 'components/action/StatusTag'
import { Action } from 'interfaces/action'
import { formatDayDate } from 'utils/date'

interface ActionRowProps {
  action: Action
  jeuneId: string
}

export default function ActionRow({ action, jeuneId }: ActionRowProps) {
  return (
    <Link href={`/mes-jeunes/${jeuneId}/actions/${action.id}`}>
      <a
        role='row'
        aria-label={`Détail de l'action ${action.content}`}
        className={`table-row cursor-pointer focus-within:primary_lighten rounded-[6px] shadow-[0_6px_25px_0px_rgba(0,0,0,0.1)] hover:bg-primary_lighten group`}
      >
        <div
          role='cell'
          className={`table-cell relative p-4 group-hover:rounded-l-[6px]`}
        >
          <span className='flex items-center border-r border-grey_500 group-hover:border-blanc'>
            <span className='text-base-medium text-ellipsis overflow-hidden max-w-[400px] whitespace-nowrap'>
              {action.content}
            </span>
            {action.comment && (
              <NoteIcon
                role='img'
                aria-label="Un commentaire a été ajouté à l'action"
                focusable='false'
                className='ml-2'
              />
            )}
          </span>
        </div>
        <div role='cell' className={`table-cell relative py-4 pr-4`}>
          <span className='flex items-center border-r border-grey_500 group-hover:border-blanc'>
            <span>{formatDayDate(new Date(action.creationDate))}</span>
          </span>
        </div>
        <div
          role='cell'
          className={`table-cell relative group-hover:rounded-r-[6px]`}
        >
          <span className='flex items-center justify-between'>
            <StatusTag status={action.status} />
            <IconComponent
              name={IconName.ChevronRight}
              focusable='false'
              aria-hidden='true'
              className='mr-6 w-6 h-6'
            />
          </span>
        </div>
      </a>
    </Link>
  )
}

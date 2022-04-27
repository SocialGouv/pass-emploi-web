import Link from 'next/link'
import React from 'react'

import ChevronIcon from '../../assets/icons/chevron_right.svg'
import NoteIcon from '../../assets/icons/note_outline.svg'

import StatusTag from 'components/action/StatusTag'
import { Action } from 'interfaces/action'
import { formatDayDate } from 'utils/date'

interface ActionRowProps {
  action: Action
  jeuneId: string
  borderStyle: string
}

export default function ActionRow({
  action,
  jeuneId,
  borderStyle,
}: ActionRowProps) {
  return (
    <Link href={`/mes-jeunes/${jeuneId}/actions/${action.id}`}>
      <a
        role='row'
        aria-label={`Détail de l'action ${action.content}`}
        className='table-row hover:bg-primary_lighten hover:outline-0 cursor-pointer focus-within:primary_lighten'
      >
        <div
          role='cell'
          className={`table-cell relative pl-4 py-4 ${borderStyle}`}
        >
          <span className='flex items-center'>
            <span className='text-ellipsis overflow-hidden max-w-[400px] whitespace-nowrap'>
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
        <div
          role='cell'
          className={`table-cell relative text-bleu_nuit ${borderStyle}`}
        >
          {formatDayDate(new Date(action.creationDate))}
        </div>
        <div role='cell' className={`table-cell relative ${borderStyle}`}>
          <span className='flex items-center justify-between'>
            <StatusTag status={action.status} />
            <ChevronIcon
              className='mr-1'
              focusable='false'
              aria-hidden='true'
            />
          </span>
        </div>
      </a>
    </Link>
  )
}

import { ActionJeune } from 'interfaces/action'

import NoteIcon from '../../assets/icons/note_outline.svg'
import ChevronIcon from '../../assets/icons/chevron_right.svg'
import React from 'react'
import Link from 'next/link'
import { formatDayDate } from 'utils/date'
import { Status } from './StatusTag'

type ActionRowProps = {
  action: ActionJeune
  jeuneId: string
}

const ActionRow = ({ action, jeuneId }: ActionRowProps) => {
  return (
    <Link href={`/mes-jeunes/${jeuneId}/actions/${action.id}`} passHref>
      <a
        role='row'
        className='table-row hover:bg-primary_lighten'
        aria-label="Détail de l'action"
      >
        <span
          role='cell'
          className='flex items-center pl-4 py-4 border-b-2 border-grey_700'
        >
          {action.content}
          {action.comment && (
            <NoteIcon
              role='img'
              aria-label="Un commentaire a été ajouté à l'action"
              focusable='false'
              className='ml-2'
            />
          )}
        </span>
        <span
          role='cell'
          className='table-cell text-bleu_nuit border-b-2 border-grey_700'
        >
          {formatDayDate(new Date(action.creationDate))}
        </span>
        <span role='cell' className='table-cell border-b-2 border-grey_700'>
          <Status status={action.status} />
        </span>
        <span role='cell' className='table-cell border-b-2 border-grey_700'>
          <ChevronIcon focusable='false' aria-hidden='true' />
        </span>
      </a>
    </Link>
  )
}

export default ActionRow

import { ActionJeune } from 'interfaces/action'

import NoteIcon from '../../assets/icons/note_outline.svg'
import ChevronIcon from '../../assets/icons/chevron_right.svg'
import React from 'react'
import Link from 'next/link'
import { formatDayDate } from 'utils/date'
import { StatusTag } from './StatusTag'

type ActionRowProps = {
  action: ActionJeune
  jeuneId: string
}

const ActionRow = ({ action, jeuneId }: ActionRowProps) => {
  const rowLink = 'absolute inset-0 focus:outline-none'
  const styles = 'relative border-solid border-0 border-b-2 border-b-grey_700'
  const url = `/mes-jeunes/${jeuneId}/actions/${action.id}`

  return (
    <Link href={url}>
      <tr className='hover:bg-primary_lighten hover:outline-0 cursor-pointer focus-within:primary_lighten'>
        <td className='relative pl-4 py-4 border-solid border-0 border-b-2 border-b-grey_700'>
          <span className='flex items-center'>
            <span className='text-ellipsis overflow-hidden max-w-[400px] whitespace-nowrap'>
              {action.content}
            </span>
            <a
              aria-label={`Détail de l'action ${action.content}`}
              href={url}
              className={rowLink}
            ></a>
            {action.comment && (
              <NoteIcon
                role='img'
                aria-label="Un commentaire a été ajouté à l'action"
                focusable='false'
                className='ml-2'
              />
            )}
          </span>
        </td>
        <td className='relative text-bleu_nuit border-solid border-0 border-b-2 border-b-grey_700'>
          {formatDayDate(new Date(action.creationDate))}
          <a
            href={`/mes-jeunes/${jeuneId}/actions/${action.id}`}
            tabIndex={-1}
            className={rowLink}
          ></a>
        </td>
        <td className={styles}>
          <span className='flex items-center justify-between'>
            <StatusTag status={action.status} />
            <a href={url} tabIndex={-1} className={rowLink}></a>
            <ChevronIcon
              className='mr-1'
              focusable='false'
              aria-hidden='true'
            />
          </span>
        </td>
      </tr>
    </Link>
  )
}

export default ActionRow

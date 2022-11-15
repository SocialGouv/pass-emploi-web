import Link from 'next/link'
import React from 'react'

import StatusTag from 'components/action/StatusTag'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import RowCell from 'components/ui/Table/RowCell'
import { Action } from 'interfaces/action'

interface AgendaActionRowProps {
  action: Action
  jeuneId: string
}

export default function AgendaActionRow({
  action,
  jeuneId,
}: AgendaActionRowProps) {
  return (
    <Link href={`/mes-jeunes/${jeuneId}/actions/${action.id}`}>
      <a
        role='row'
        aria-label={`Détail de l'action ${action.content}`}
        className={`table-row text-base-regular rounded-small shadow-s hover:bg-primary_lighten`}
      >
        <RowCell className='rounded-l-small'>
          <span className='flex items-center justify-center'>
            <IconComponent
              name={IconName.Actions}
              focusable='false'
              aria-label={`Action`}
              className='w-6 h-6'
            />
          </span>
        </RowCell>

        <RowCell>
          <span className='flex items-center'>{action.content}</span>
        </RowCell>

        <RowCell>
          <span className='flex justify-end'>
            <StatusTag status={action.status} />
          </span>
        </RowCell>

        <RowCell className='rounded-r-small'>
          <span className='flex items-center justify-end'>
            <IconComponent
              name={IconName.ChevronRight}
              focusable='false'
              aria-hidden='true'
              className='w-6 h-6 fill-content_color'
            />
          </span>
        </RowCell>
      </a>
    </Link>
  )
}

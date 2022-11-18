import Link from 'next/link'
import React from 'react'

import StatusTag from 'components/action/StatusTag'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import RowCell from 'components/ui/Table/RowCell'
import { Action } from 'interfaces/action'
import { EntreeAgenda } from 'interfaces/agenda'

interface AgendaActionRowProps {
  action: EntreeAgenda
  jeuneId: string
}

export default function AgendaActionRow({
  action,
  jeuneId,
}: AgendaActionRowProps) {
  return (
    <li className='contents'>
      <Link href={`/mes-jeunes/${jeuneId}/actions/${action.id}`}>
        <a
          aria-label={`Détail de l'action ${action.titre}, ${action.statut}`}
          className={`contents text-base-regular rounded-small shadow-s hover:bg-primary_lighten`}
        >
          <div className='rounded-l-small'>
            <IconComponent
              name={IconName.Actions}
              focusable='false'
              aria-label={`Action`}
              title={`Action`}
              className='w-6 h-6'
            />
          </div>

          <div>{action.titre}</div>

          <div className='flex justify-end'>
            <StatusTag status={action.statut!} />
            <IconComponent
              name={IconName.ChevronRight}
              focusable='false'
              aria-hidden='true'
              className='w-6 h-6 fill-content_color'
            />
          </div>
        </a>
      </Link>
    </li>
  )
}

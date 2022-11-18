import Link from 'next/link'
import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import RowCell from 'components/ui/Table/RowCell'
import { EntreeAgenda } from 'interfaces/agenda'

interface AgendaRdvRowProps {
  rdv: EntreeAgenda
}

export function AgendaRdvRow({ rdv }: AgendaRdvRowProps) {
  return (
    <li className='contents'>
      <Link href={'/mes-jeunes/edition-rdv?idRdv=' + rdv.id}>
        <a
          aria-label={`Consulter l’événement du ${rdv.titre}`}
          className='contents text-base-regular rounded-small shadow-s hover:bg-primary_lighten'
        >
          <div className='rounded-l-small'>
            <IconComponent
              name={IconName.Calendar}
              focusable='false'
              aria-label={`Événement`}
              title={`Événement`}
              className='w-6 h-6'
            />
          </div>

          <div className='rounded-l-small'>{rdv.titre}</div>

          <div className='rounded-r-small'>
            <IconComponent
              name={IconName.ChevronRight}
              focusable='false'
              aria-hidden='true'
              className='w-6 h-6 ml-auto fill-content_color'
            />
          </div>
        </a>
      </Link>
    </li>
  )
}

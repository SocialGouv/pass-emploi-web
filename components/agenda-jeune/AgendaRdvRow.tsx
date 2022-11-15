import { DateTime } from 'luxon'
import Link from 'next/link'
import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import RowCell from 'components/ui/Table/RowCell'
import { RdvListItem } from 'interfaces/rdv'
import { DATETIME_LONG, toFrenchFormat, WEEKDAY_MONTH_LONG } from 'utils/date'

interface AgendaRdvRowProps {
  rdv: RdvListItem
}

export function AgendaRdvRow({ rdv }: AgendaRdvRowProps) {
  const date = DateTime.fromISO(rdv.date)
  const fullDate = toFrenchFormat(date, WEEKDAY_MONTH_LONG)
  const timeAndType = `${toFrenchFormat(date, DATETIME_LONG)} - ${rdv.type}`

  return (
    <Link href={'/mes-jeunes/edition-rdv?idRdv=' + rdv.id}>
      <a
        role='row'
        aria-label={`Consulter l’événement du ${fullDate}`}
        className='table-row text-base-regular rounded-small shadow-s hover:bg-primary_lighten'
      >
        <RowCell className='rounded-l-small'>
          <span className='flex items-center justify-center'>
            <IconComponent
              name={IconName.Calendar}
              focusable='false'
              aria-label={`Événement`}
              className='w-6 h-6'
            />
          </span>
        </RowCell>

        <RowCell className='rounded-l-small'>{timeAndType}</RowCell>

        <RowCell>
          <></>
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

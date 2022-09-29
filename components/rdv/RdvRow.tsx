import { DateTime } from 'luxon'
import Link from 'next/link'
import React, { useMemo } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { DataTag } from 'components/ui/Indicateurs/DataTag'
import RowCell from 'components/ui/Table/RowCell'
import { RdvListItem } from 'interfaces/rdv'
import {
  WEEKDAY_MONTH_LONG,
  TIME_24_H_SEPARATOR,
  toShortDate,
  toFrenchFormat,
} from 'utils/date'

interface RdvRowProps {
  rdv: RdvListItem
  idConseiller: string
  withNameJeune?: boolean
  withDate?: boolean
}

export function RdvRow({
  rdv,
  withNameJeune,
  withDate,
  idConseiller,
}: RdvRowProps) {
  const date = useMemo(() => DateTime.fromISO(rdv.date), [rdv.date])
  const shortDate = useMemo(() => toShortDate(date), [date])
  const fullDate = useMemo(
    () => toFrenchFormat(date, WEEKDAY_MONTH_LONG),
    [date]
  )
  const timeAndDuration = useMemo(
    () => `${toFrenchFormat(date, TIME_24_H_SEPARATOR)} - ${rdv.duration} min`,
    [date, rdv.duration]
  )

  return (
    <Link href={'/mes-jeunes/edition-rdv?idRdv=' + rdv.id}>
      <a
        role='row'
        aria-label={`Modifier rendez-vous du ${fullDate} avec ${rdv.beneficiaires}`}
        className='table-row text-base-regular rounded-small shadow-s hover:bg-primary_lighten'
      >
        <RowCell className='rounded-l-small'>
          <span aria-label={fullDate}>{withDate && `${shortDate} - `}</span>
          {timeAndDuration}
        </RowCell>

        {withNameJeune && <RowCell>{rdv.beneficiaires}</RowCell>}

        <RowCell>
          <DataTag type={rdv.type} />
        </RowCell>

        <RowCell>
          <IconComponent
            name={IconName.Location}
            focusable='false'
            aria-hidden='true'
            className='mr-2 inline'
          />
          {rdv.modality}
        </RowCell>

        {rdv.idCreateur && (
          <RowCell className='rounded-r-small'>
            <span className='flex items-center justify-between'>
              {rdv.idCreateur === idConseiller && (
                <>
                  <span className='sr-only'>oui</span>
                  <IconComponent
                    name={IconName.RoundedCheckFilled}
                    aria-hidden='true'
                    focusable='false'
                    className='h-3 fill-primary'
                  />
                </>
              )}
              {rdv.idCreateur !== idConseiller && (
                <>
                  <span className='sr-only'>non</span>
                  <IconComponent
                    name={IconName.Ko}
                    aria-hidden='true'
                    focusable='false'
                    className='h-3'
                  />
                </>
              )}
              <IconComponent
                name={IconName.ChevronRight}
                focusable='false'
                aria-hidden='true'
                className='w-6 h-6 fill-content_color'
              />
            </span>
          </RowCell>
        )}
        {!rdv.idCreateur && <div role='cell' />}
      </a>
    </Link>
  )
}

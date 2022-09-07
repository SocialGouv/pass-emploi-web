import Link from 'next/link'
import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { RdvTypeTag } from 'components/ui/Indicateurs/RdvTypeTag'
import RowCell from 'components/ui/Table/RowCell'
import { RdvListItem } from 'interfaces/rdv'
import {
  formatDayDate,
  formatHourMinuteDate,
  formatWeekdayWithMonth,
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
  const dayHourCells = (rdvDate: Date, duration: number) => {
    return `${formatHourMinuteDate(rdvDate)} - ${duration} min`
  }
  return (
    <Link href={'/mes-jeunes/edition-rdv?idRdv=' + rdv.id}>
      <a
        role='row'
        aria-label={`Modifier rendez-vous du ${formatWeekdayWithMonth(
          new Date(rdv.date)
        )} avec ${rdv.beneficiaires}`}
        className='table-row text-base-regular rounded-small shadow-s hover:bg-primary_lighten'
      >
        <RowCell className='rounded-l-small'>
          <span aria-label={formatWeekdayWithMonth(new Date(rdv.date))}>
            {withDate && `${formatDayDate(new Date(rdv.date))} - `}
          </span>
          {dayHourCells(new Date(rdv.date), rdv.duration)}
        </RowCell>

        {withNameJeune && <RowCell>{rdv.beneficiaires}</RowCell>}

        <RowCell>
          <RdvTypeTag type={rdv.type} />
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
                    name={IconName.CheckRounded}
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

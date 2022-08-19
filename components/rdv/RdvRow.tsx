import Link from 'next/link'
import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { RdvTypeTag } from 'components/ui/Indicateurs/RdvTypeTag'
import CellRow from 'components/ui/Table/CellRow'
import { RdvListItem } from 'interfaces/rdv'
import { formatHourMinuteDate, formatWeekdayWithMonth } from 'utils/date'

interface RdvRowProps {
  item: RdvListItem
  withNameJeune: boolean | undefined
  idConseiller: string
}

export function RdvRow({ item, withNameJeune, idConseiller }: RdvRowProps) {
  const dayHourCells = (rdvDate: Date, duration: number) => {
    return `${formatHourMinuteDate(rdvDate)} - ${duration} min`
  }
  return (
    <Link href={'/mes-jeunes/edition-rdv?idRdv=' + item.id}>
      <a
        role='row'
        aria-label={`Modifier rendez-vous du ${formatWeekdayWithMonth(
          new Date(item.date)
        )} avec ${item.beneficiaires}`}
        className='table-row text-base-regular rounded-small shadow-s hover:bg-primary_lighten'
      >
        <CellRow className='rounded-l-small'>
          <span className='sr-only'>
            {formatWeekdayWithMonth(new Date(item.date))}
          </span>
          {dayHourCells(new Date(item.date), item.duration)}
        </CellRow>
        {withNameJeune && <CellRow>{item.beneficiaires}</CellRow>}

        <CellRow>
          <RdvTypeTag type={item.type} />
        </CellRow>

        <CellRow>
          <IconComponent
            name={IconName.Location}
            focusable='false'
            aria-hidden='true'
            className='mr-2 inline'
          />
          {item.modality}
        </CellRow>

        {item.idCreateur && (
          <CellRow className='rounded-r-small'>
            <span className='flex items-center justify-between'>
              {item.idCreateur === idConseiller && (
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
              {item.idCreateur !== idConseiller && (
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
          </CellRow>
        )}
        {!item.idCreateur && <div role='cell' />}
      </a>
    </Link>
  )
}

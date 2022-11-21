import { DateTime } from 'luxon'
import React, { useMemo } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { DataTag } from 'components/ui/Indicateurs/DataTag'
import TD from 'components/ui/Table/TD'
import { TR } from 'components/ui/Table/TR'
import { EvenementListItem } from 'interfaces/evenement'
import {
  TIME_24_H_SEPARATOR,
  toFrenchFormat,
  toShortDate,
  WEEKDAY_MONTH_LONG,
} from 'utils/date'

interface RdvRowProps {
  rdv: EvenementListItem
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
    () => `${toFrenchFormat(date, TIME_24_H_SEPARATOR)} - ${rdv.duree} min`,
    [date, rdv.duree]
  )

  return (
    <TR
      href={'/mes-jeunes/edition-rdv?idRdv=' + rdv.id}
      label={`Consulter l’événement du ${fullDate} avec ${rdv.beneficiaires}`}
    >
      <TD className='rounded-l-small'>
        <span aria-label={fullDate}>{withDate && `${shortDate} - `}</span>
        {timeAndDuration}
      </TD>

      {withNameJeune && <TD>{rdv.beneficiaires}</TD>}

      <TD>
        <DataTag text={rdv.type} />
      </TD>

      <TD>
        <IconComponent
          name={IconName.Location}
          focusable='false'
          aria-hidden='true'
          className='inline mr-2 h-6 w-6 fill-primary'
        />
        {rdv.modality}
      </TD>

      <TD className='rounded-r-small'>
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
      </TD>
    </TR>
  )
}

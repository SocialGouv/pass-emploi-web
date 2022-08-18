import React from 'react'

import { HeaderColumnCell } from '../ui/Table/HeaderColumnCell'
import TableLayout from '../ui/Table/TableLayout'

import { RdvRow } from 'components/rdv/RdvRow'
import { JourRdvAVenirItem, RdvListItem } from 'interfaces/rdv'
import { formatDayDate, formatHourMinuteDate } from 'utils/date'

type TableauRdvProps = {
  rdvs: Array<RdvListItem | JourRdvAVenirItem>
  idConseiller: string
  withNameJeune?: boolean
}

export default function TableauRdv({
  rdvs,
  idConseiller,
  withNameJeune = true,
}: TableauRdvProps) {
  const dayHourCells = (rdvDate: Date, duration: number) => {
    return `${formatDayDate(rdvDate)} - ${formatHourMinuteDate(
      rdvDate
    )} - ${duration} min`
  }

  return (
    <>
      {rdvs.length === 0 && (
        <p className='text-base-regular mb-2'>
          Vous n’avez pas de rendez-vous pour le moment
        </p>
      )}
      {rdvs.length > 0 && (
        <TableLayout describedBy='table-caption'>
          <div id='table-caption' className='sr-only'>
            Liste de mes rendez-vous
          </div>
          <div role='rowgroup' className='table-row-group'>
            <div role='row' className='table-row'>
              <HeaderColumnCell>Horaires</HeaderColumnCell>
              {withNameJeune && <HeaderColumnCell>Prénom Nom</HeaderColumnCell>}
              <HeaderColumnCell>Type</HeaderColumnCell>
              <HeaderColumnCell>Modalité</HeaderColumnCell>
              <HeaderColumnCell>Créé par vous</HeaderColumnCell>
            </div>
          </div>

          <div role='rowgroup' className='table-row-group'>
            {rdvs.map((item: RdvListItem | JourRdvAVenirItem) => {
              if (item instanceof JourRdvAVenirItem) {
                return <p className={'text-m-bold'}>{item.label}</p>
              } else {
                return (
                  <RdvRow
                    key={item.id}
                    item={item}
                    horaire={dayHourCells(new Date(item.date), item.duration)}
                    withNameJeune={withNameJeune}
                    idConseiller={idConseiller}
                  />
                )
              }
            })}
          </div>
        </TableLayout>
      )}
    </>
  )
}

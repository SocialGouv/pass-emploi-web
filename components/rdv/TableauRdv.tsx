import React from 'react'

import { HeaderColumnCell } from '../ui/Table/HeaderColumnCell'
import TableLayout from '../ui/Table/TableLayout'

import { RdvRow } from 'components/rdv/RdvRow'
import { JourRdvAVenirItem, PlageHoraire, RdvListItem } from 'interfaces/rdv'
import { AUJOURDHUI_LABEL } from 'presentation/MesRdvViewModel'

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
  //FIXME: Balise <tr> ne peut pas être enfant d'une div
  function labelRdvDate(item: JourRdvAVenirItem, dateIsToday: boolean = false) {
    return (
      <tr key={item.label}>
        <th
          colSpan={6}
          className={`table-cell capitalize text-m-bold before:content-['---------'] before:tracking-tighter after:content-['---------'] after:tracking-tighter before:whitespace-pre ${
            dateIsToday ? 'text-primary' : 'text-content_color'
          } `}
        >
          <span className='mx-4'>{item.label}</span>
        </th>
      </tr>
    )
  }

  function labelPlageHoraire(item: PlageHoraire) {
    return (
      <tr key={item.label}>
        <th colSpan={1} className={`table-cell text-s-bold text-content_color`}>
          <span className='float-left'>{item.label}</span>
        </th>
      </tr>
    )
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
            {rdvs.map(
              (item: RdvListItem | JourRdvAVenirItem | PlageHoraire) => {
                if (item instanceof JourRdvAVenirItem)
                  return item.label === AUJOURDHUI_LABEL
                    ? labelRdvDate(item, true)
                    : labelRdvDate(item)
                else if (item instanceof PlageHoraire) {
                  return labelPlageHoraire(item)
                } else {
                  return (
                    <RdvRow
                      key={item.id}
                      item={item}
                      withNameJeune={withNameJeune}
                      idConseiller={idConseiller}
                    />
                  )
                }
              }
            )}
          </div>
        </TableLayout>
      )}
    </>
  )
}

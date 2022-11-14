import React, { useMemo } from 'react'

import EmptyStateImage from 'assets/images/empty_state.svg'
import { RdvRow } from 'components/rdv/RdvRow'
import { HeaderCell } from 'components/ui/Table/HeaderCell'
import TableLayout from 'components/ui/Table/TableLayout'
import { RdvListItem } from 'interfaces/rdv'
import {
  AUJOURDHUI_LABEL,
  IntercalaireJour,
  IntercalairePlageHoraire,
  rdvsWithIntercalaires,
} from 'presentation/MesRdvViewModel'

type TableauRdvProps = {
  idConseiller: string
  rdvs: RdvListItem[]
  withIntercalaires?: boolean
  withNameJeune?: boolean
}

export default function TableauRdv({
  rdvs,
  idConseiller,
  withIntercalaires = false,
  withNameJeune = true,
}: TableauRdvProps) {
  const rdvsAffiches = useMemo(
    () => (withIntercalaires ? rdvsWithIntercalaires(rdvs) : rdvs),
    [rdvs, withIntercalaires]
  )

  //FIXME: Balise <tr> ne peut pas être enfant d'une div, mais problème avec colSpan
  function intercalaireDate(item: IntercalaireJour) {
    return (
      <tr key={item.label}>
        <th
          colSpan={6}
          className={`table-cell text-m-bold capitalize ${
            item.label === AUJOURDHUI_LABEL
              ? 'text-primary'
              : 'text-content_color'
          } `}
        >
          <span className='tracking-tighter'>---------</span>
          <span className='mx-4'>{item.label}</span>
          <span className='tracking-tighter'>---------</span>
        </th>
      </tr>
    )
  }

  //FIXME: Balise <tr> ne peut pas être enfant d'une div, mais problème avec colSpan
  function intercalairePlageHoraire(
    item: IntercalairePlageHoraire,
    key: number
  ) {
    return (
      <tr key={item.label + key}>
        <th colSpan={1} className='table-cell text-s-bold text-content_color'>
          <span className='float-left'>{item.label}</span>
        </th>
      </tr>
    )
  }

  return (
    <>
      {rdvs.length === 0 && (
        <div className='flex flex-col justify-center items-center'>
          <EmptyStateImage
            focusable={false}
            aria-hidden={true}
            className='w-[360px] h-[200px]'
          />
          <p className='mt-4 text-base-medium w-2/3 text-center'>
            Il n’y a pas d’événement sur cette période.
          </p>
        </div>
      )}

      {rdvs.length > 0 && (
        <TableLayout caption='Liste de mes événements'>
          <div role='rowgroup' className='table-row-group'>
            <div role='row' className='table-row'>
              <HeaderCell>Horaires</HeaderCell>
              {withNameJeune && <HeaderCell>Bénéficiaire</HeaderCell>}
              <HeaderCell>Type</HeaderCell>
              <HeaderCell>Modalité</HeaderCell>
              <HeaderCell>Créé par vous</HeaderCell>
            </div>
          </div>

          <div role='rowgroup' className='table-row-group'>
            {rdvsAffiches.map(
              (
                item: RdvListItem | IntercalaireJour | IntercalairePlageHoraire,
                key
              ) => {
                if (item instanceof IntercalaireJour) {
                  return intercalaireDate(item)
                } else if (item instanceof IntercalairePlageHoraire) {
                  return intercalairePlageHoraire(item, key)
                } else {
                  return (
                    <RdvRow
                      key={item.id}
                      rdv={item}
                      withDate={!withIntercalaires}
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

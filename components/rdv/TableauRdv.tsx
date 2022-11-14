import { DateTime } from 'luxon'
import React, { useMemo } from 'react'

import EmptyStateImage from 'assets/images/empty_state.svg'
import { RdvRow } from 'components/rdv/RdvRow'
import { HeaderCell } from 'components/ui/Table/HeaderCell'
import TableLayout from 'components/ui/Table/TableLayout'
import { RdvListItem } from 'interfaces/rdv'
import {
  insertIntercalaires,
  renderListeWithIntercalaires,
} from 'presentation/Intercalaires'

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
    () =>
      withIntercalaires
        ? insertIntercalaires(rdvs, ({ date }) => DateTime.fromISO(date))
        : rdvs,
    [rdvs, withIntercalaires]
  )

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
            {renderListeWithIntercalaires(rdvsAffiches, (rdv) => (
              <RdvRow
                key={rdv.id}
                rdv={rdv}
                withDate={!withIntercalaires}
                withNameJeune={withNameJeune}
                idConseiller={idConseiller}
              />
            ))}
          </div>
        </TableLayout>
      )}
    </>
  )
}

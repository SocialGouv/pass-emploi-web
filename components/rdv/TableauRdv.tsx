import { DateTime } from 'luxon'
import React, { useMemo } from 'react'

import EmptyStateImage from 'assets/images/empty_state.svg'
import { RdvRow } from 'components/rdv/RdvRow'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import { TR } from 'components/ui/Table/TR'
import { EvenementListItem } from 'interfaces/evenement'
import { BaseJeune } from 'interfaces/jeune'
import {
  insertIntercalaires,
  renderListeWithIntercalaires,
} from 'presentation/Intercalaires'

type TableauRdvProps = {
  idConseiller: string
  rdvs: EvenementListItem[]
  withIntercalaires?: boolean
  beneficiaireUnique?: BaseJeune
}

export default function TableauRdv({
  rdvs,
  idConseiller,
  withIntercalaires = false,
  beneficiaireUnique,
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
        <Table asDiv={true} caption='Liste de mes événements'>
          <THead>
            <TR isHeader={true}>
              <TH>Horaires</TH>
              {!beneficiaireUnique && <TH>Bénéficiaire</TH>}
              <TH>Type</TH>
              <TH>Modalité</TH>
              <TH>Créé par vous</TH>
            </TR>
          </THead>

          <TBody>
            {renderListeWithIntercalaires(rdvsAffiches, (rdv) => (
              <RdvRow
                key={rdv.id}
                rdv={rdv}
                withDate={!withIntercalaires}
                beneficiaireUnique={beneficiaireUnique}
                idConseiller={idConseiller}
              />
            ))}
          </TBody>
        </Table>
      )}
    </>
  )
}

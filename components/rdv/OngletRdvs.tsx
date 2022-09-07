import React from 'react'

import { IntegrationPoleEmploi } from 'components/jeune/IntegrationPoleEmploi'
import TableauRdv from 'components/rdv/TableauRdv'
import { RdvListItem } from 'interfaces/rdv'

interface OngletRdvsProps {
  rdvs: RdvListItem[]
  poleEmploi: boolean
  idConseiller: string
}

export function OngletRdvs({
  idConseiller,
  poleEmploi,
  rdvs,
}: OngletRdvsProps) {
  return (
    <>
      {!poleEmploi ? (
        <TableauRdv
          rdvs={rdvs}
          idConseiller={idConseiller}
          withNameJeune={false}
        />
      ) : (
        <IntegrationPoleEmploi label='convocations' />
      )}
    </>
  )
}

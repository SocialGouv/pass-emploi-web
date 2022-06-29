import React from 'react'

import { IntegrationPoleEmploi } from 'components/jeune/IntegrationPoleEmploi'
import RdvList from 'components/rdv/RdvList'
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
        <RdvList
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

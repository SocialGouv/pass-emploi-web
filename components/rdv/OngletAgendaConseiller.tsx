import { DateTime } from 'luxon'
import React, { useState } from 'react'

import TableauRdv from 'components/rdv/TableauRdv'
import { SelecteurPeriode } from 'components/ui/SelecteurPeriode'
import { RdvListItem } from 'interfaces/rdv'

type OngletAgendaConseillerProps = {
  idConseiller: string | undefined
  recupererRdvs: (
    idConseiller: string,
    dateDebut: DateTime,
    dateFin: DateTime
  ) => Promise<RdvListItem[]>
  trackNavigation: (append?: string) => void
}
export function OngletAgendaConseiller({
  idConseiller,
  recupererRdvs,
  trackNavigation,
}: OngletAgendaConseillerProps) {
  const [rdvs, setRdvs] = useState<RdvListItem[]>([])

  async function chargerRdvs(dateDebut: DateTime, dateFin: DateTime) {
    const evenements = await recupererRdvs(idConseiller!, dateDebut, dateFin)
    setRdvs(evenements)
  }

  return (
    <>
      {idConseiller && (
        <SelecteurPeriode
          onNouvellePeriode={chargerRdvs}
          nombreJours={7}
          trackNavigation={trackNavigation}
        />
      )}

      <TableauRdv
        idConseiller={idConseiller ?? ''}
        rdvs={rdvs ?? []}
        withIntercalaires={true}
      />
    </>
  )
}

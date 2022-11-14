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

  async function chargerRdvs7Jours(dateDebut: DateTime, dateFin: DateTime) {
    const rdvs7Jours = await recupererRdvs(idConseiller!, dateDebut, dateFin)
    setRdvs(rdvs7Jours)
  }

  return (
    <>
      {idConseiller && (
        <SelecteurPeriode
          onNouvellePeriode={chargerRdvs7Jours}
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

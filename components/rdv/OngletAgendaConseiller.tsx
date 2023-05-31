import { DateTime } from 'luxon'
import React, { useState } from 'react'

import TableauRdv from 'components/rdv/TableauRdv'
import { SelecteurPeriode } from 'components/ui/SelecteurPeriode'
import { EvenementListItem } from 'interfaces/evenement'

type OngletAgendaConseillerProps = {
  idConseiller: string
  recupererRdvs: (
    idConseiller: string,
    dateDebut: DateTime,
    dateFin: DateTime
  ) => Promise<EvenementListItem[]>
  trackNavigation: (append?: string) => void
}

export default function OngletAgendaConseiller({
  idConseiller,
  recupererRdvs,
  trackNavigation,
}: OngletAgendaConseillerProps) {
  const [rdvs, setRdvs] = useState<EvenementListItem[]>([])

  async function chargerRdvs(dateDebut: DateTime, dateFin: DateTime) {
    const evenements = await recupererRdvs(idConseiller!, dateDebut, dateFin)
    setRdvs(evenements)
  }

  return (
    <>
      <SelecteurPeriode
        onNouvellePeriode={chargerRdvs}
        nombreJours={7}
        trackNavigation={trackNavigation}
      />

      <TableauRdv
        idConseiller={idConseiller}
        rdvs={rdvs ?? []}
        withIntercalaires={true}
      />
    </>
  )
}

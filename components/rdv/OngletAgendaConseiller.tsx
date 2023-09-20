import { DateTime } from 'luxon'
import React, { useState } from 'react'

import TableauRdv from 'components/rdv/TableauRdv'
import { SelecteurPeriode } from 'components/ui/SelecteurPeriode'
import { Conseiller, peutAccederAuxSessions } from 'interfaces/conseiller'
import { EvenementListItem } from 'interfaces/evenement'
import { compareDates } from 'utils/date'

type OngletAgendaConseillerProps = {
  conseiller: Conseiller
  recupererRdvs: (
    idConseiller: string,
    dateDebut: DateTime,
    dateFin: DateTime
  ) => Promise<EvenementListItem[]>
  recupererSessionsBeneficiaires: (
    idConseiller: string,
    dateDebut: DateTime,
    dateFin: DateTime
  ) => Promise<EvenementListItem[]>
  trackNavigation: (append?: string) => void
}

export default function OngletAgendaConseiller({
  conseiller,
  recupererRdvs,
  recupererSessionsBeneficiaires,
  trackNavigation,
}: OngletAgendaConseillerProps) {
  const [rdvs, setRdvs] = useState<EvenementListItem[]>([])

  async function chargerRdvs(dateDebut: DateTime) {
    const deuxiemeJour = dateDebut.plus({ day: 1 }).endOf('day')

    const evenements = await recupererRdvs(
      conseiller.id,
      dateDebut,
      deuxiemeJour
    )

    let sessions: EvenementListItem[] = []
    if (peutAccederAuxSessions(conseiller)) {
      sessions = await recupererSessionsBeneficiaires(
        conseiller.id,
        dateDebut,
        deuxiemeJour
      )
    }

    setRdvs(
      evenements
        .concat(sessions)
        .sort((event1, event2) =>
          compareDates(
            DateTime.fromISO(event1.date),
            DateTime.fromISO(event2.date)
          )
        )
    )
  }

  return (
    <>
      <SelecteurPeriode
        onNouvellePeriode={chargerRdvs}
        nombreJours={7}
        trackNavigation={trackNavigation}
      />

      <TableauRdv
        idConseiller={conseiller.id}
        rdvs={rdvs ?? []}
        withIntercalaires={true}
      />
    </>
  )
}

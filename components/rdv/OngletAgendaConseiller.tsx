import { DateTime } from 'luxon'
import React, { useState } from 'react'

import TableauRdvsConseiller from 'components/rdv/TableauRdvsConseiller'
import { SelecteurPeriode } from 'components/ui/SelecteurPeriode'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import { Conseiller, peutAccederAuxSessions } from 'interfaces/conseiller'
import { EvenementListItem } from 'interfaces/evenement'
import { AgendaData, buildAgenda } from 'presentation/Intercalaires'
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
  const [agendaRdvs, setAgendaRdvs] = useState<AgendaData<EvenementListItem>>()

  async function chargerRdvs(dateDebut: DateTime, dateFin: DateTime) {
    setAgendaRdvs(undefined)

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

    const rdvs = evenements
      .concat(sessions)
      .sort((event1, event2) =>
        compareDates(
          DateTime.fromISO(event1.date),
          DateTime.fromISO(event2.date)
        )
      )
    setAgendaRdvs(
      buildAgenda(rdvs, { debut: dateDebut, fin: dateFin }, ({ date }) =>
        DateTime.fromISO(date)
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

      {!agendaRdvs && <SpinningLoader />}

      {agendaRdvs && (
        <TableauRdvsConseiller
          idConseiller={conseiller.id}
          agendaRdvs={agendaRdvs}
        />
      )}
    </>
  )
}

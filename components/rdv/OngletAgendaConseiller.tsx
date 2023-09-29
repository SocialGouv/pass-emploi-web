import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'

import TableauEvenementsConseiller from 'components/rdv/TableauEvenementsConseiller'
import { SelecteurPeriode } from 'components/ui/SelecteurPeriode'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import { Conseiller, peutAccederAuxSessions } from 'interfaces/conseiller'
import { EvenementListItem } from 'interfaces/evenement'
import { AgendaData, buildAgendaData } from 'presentation/AgendaRows'
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
  periodeIndex: number
  changerPeriode: (index: number) => void
}

export default function OngletAgendaConseiller({
  conseiller,
  recupererRdvs,
  recupererSessionsBeneficiaires,
  trackNavigation,
  periodeIndex,
  changerPeriode,
}: OngletAgendaConseillerProps) {
  const [evenements, setEvenements] = useState<EvenementListItem[]>()
  const [periode, setPeriode] = useState<{ debut: DateTime; fin: DateTime }>()
  const [indexJoursCharges, setIndexJoursCharges] = useState<number[]>()
  const [agendaEvenements, setAgendaEvenements] =
    useState<AgendaData<EvenementListItem>>()

  async function chargerNouvellePeriode(
    nouvellePeriodeIndex: number,
    dateDebut: DateTime,
    dateFin: DateTime
  ) {
    await initEvenementsPeriode(dateDebut, dateFin)
    changerPeriode(nouvellePeriodeIndex)
  }

  async function initEvenementsPeriode(dateDebut: DateTime, dateFin: DateTime) {
    setAgendaEvenements(undefined)

    const deuxiemeJour = dateDebut.plus({ day: 1 }).endOf('day')
    const evenementsPeriode = await chargerEvenements(dateDebut, deuxiemeJour)

    setPeriode({ debut: dateDebut, fin: dateFin })
    setIndexJoursCharges([0, 1])
    setEvenements(evenementsPeriode)
  }

  async function chargerEvenementsJour(jourACharger: DateTime) {
    const evenements = await chargerEvenements(
      jourACharger.startOf('day'),
      jourACharger.endOf('day')
    )

    setIndexJoursCharges((current) => {
      const indexJourACharger: number = jourACharger
        .diff(periode!.debut)
        .as('days')
      return current!.concat(indexJourACharger)
    })
    setEvenements((current) => current!.concat(evenements))
  }

  async function chargerEvenements(
    dateDebut: DateTime,
    dateFin: DateTime
  ): Promise<EvenementListItem[]> {
    const rdvs = await recupererRdvs(conseiller.id, dateDebut, dateFin)

    let sessions: EvenementListItem[] = []
    if (peutAccederAuxSessions(conseiller)) {
      sessions = await recupererSessionsBeneficiaires(
        conseiller.id,
        dateDebut,
        dateFin
      )
    }

    return rdvs
      .concat(sessions)
      .sort((event1, event2) =>
        compareDates(
          DateTime.fromISO(event1.date),
          DateTime.fromISO(event2.date)
        )
      )
  }

  useEffect(() => {
    if (evenements && periode && indexJoursCharges) {
      setAgendaEvenements(
        buildAgendaData(
          evenements,
          periode,
          ({ date }) => DateTime.fromISO(date),
          indexJoursCharges
        )
      )
    }
  }, [evenements, periode, indexJoursCharges])

  return (
    <>
      <SelecteurPeriode
        onNouvellePeriode={chargerNouvellePeriode}
        periodeCourante={periodeIndex}
        nombreJours={7}
        trackNavigation={trackNavigation}
      />

      {!agendaEvenements && <SpinningLoader />}

      {agendaEvenements && (
        <TableauEvenementsConseiller
          idConseiller={conseiller.id}
          agendaEvenements={agendaEvenements}
          onChargerEvenementsJour={chargerEvenementsJour}
        />
      )}
    </>
  )
}

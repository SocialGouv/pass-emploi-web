import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

import TableauRdvsConseiller from 'components/rdv/TableauRdvsConseiller'
import { SelecteurPeriode } from 'components/ui/SelecteurPeriode'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import { Conseiller, peutAccederAuxSessions } from 'interfaces/conseiller'
import { EvenementListItem } from 'interfaces/evenement'
import { AgendaData, buildAgenda } from 'presentation/Intercalaires'
import { compareDates } from 'utils/date'
import { ApiError } from 'utils/httpClient'

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
  const router = useRouter()
  const [rdvs, setRdvs] = useState<EvenementListItem[]>()
  const [periode, setPeriode] = useState<{ debut: DateTime; fin: DateTime }>()
  const [indexJoursCharges, setIndexJoursCharges] = useState<number[]>()
  const [agendaRdvs, setAgendaRdvs] = useState<AgendaData<EvenementListItem>>()

  async function chargerNouvellePeriode(
    nouvellePeriodeIndex: number,
    dateDebut: DateTime,
    dateFin: DateTime
  ) {
    await initEvenementsPeriode(dateDebut, dateFin)
    changerPeriode(nouvellePeriodeIndex)
  }

  async function initEvenementsPeriode(dateDebut: DateTime, dateFin: DateTime) {
    setAgendaRdvs(undefined)

    const deuxiemeJour = dateDebut.plus({ day: 1 }).endOf('day')
    const evenementsEtSessions = await chargerEvenements(
      dateDebut,
      deuxiemeJour
    )

    setPeriode({ debut: dateDebut, fin: dateFin })
    setIndexJoursCharges([0, 1])
    setRdvs(evenementsEtSessions)
  }

  async function chargerEvenementsJour(jourACharger: DateTime) {
    const evenementsEtSessions = await chargerEvenements(
      jourACharger.startOf('day'),
      jourACharger.endOf('day')
    )

    setIndexJoursCharges((current) => {
      const indexJourACharger: number = jourACharger
        .diff(periode!.debut)
        .as('days')
      return current!.concat(indexJourACharger)
    })
    setRdvs((current) => current!.concat(evenementsEtSessions))
  }

  async function chargerEvenements(
    dateDebut: DateTime,
    dateFin: DateTime
  ): Promise<EvenementListItem[]> {
    const evenements = await recupererRdvs(conseiller.id, dateDebut, dateFin)

    let sessions: EvenementListItem[] = []
    if (peutAccederAuxSessions(conseiller)) {
      try {
        sessions = await recupererSessionsBeneficiaires(
          conseiller.id,
          dateDebut,
          dateFin
        )
      } catch (e) {
        if (e instanceof ApiError && e.statusCode === 401) {
          await router.push('/api/auth/federated-logout')
        }
        throw e
      }
    }

    return evenements
      .concat(sessions)
      .sort((event1, event2) =>
        compareDates(
          DateTime.fromISO(event1.date),
          DateTime.fromISO(event2.date)
        )
      )
  }

  useEffect(() => {
    if (rdvs && periode && indexJoursCharges) {
      setAgendaRdvs(
        buildAgenda(
          rdvs,
          periode,
          ({ date }) => DateTime.fromISO(date),
          indexJoursCharges
        )
      )
    }
  }, [rdvs, periode, indexJoursCharges])

  return (
    <>
      <SelecteurPeriode
        onNouvellePeriode={chargerNouvellePeriode}
        periodeCourante={periodeIndex}
        nombreJours={7}
        trackNavigation={trackNavigation}
      />

      {!agendaRdvs && <SpinningLoader />}

      {agendaRdvs && (
        <TableauRdvsConseiller
          idConseiller={conseiller.id}
          agendaRdvs={agendaRdvs}
          onChargerEvenementsJour={chargerEvenementsJour}
        />
      )}
    </>
  )
}

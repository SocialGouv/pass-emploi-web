import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import TableauRdvsConseiller from 'components/rdv/TableauRdvsConseiller'
import { SelecteurPeriode } from 'components/ui/SelecteurPeriode'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import { Conseiller, peutAccederAuxSessions } from 'interfaces/conseiller'
import { EvenementListItem } from 'interfaces/evenement'
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
}

export default function OngletAgendaConseiller({
  conseiller,
  recupererRdvs,
  recupererSessionsBeneficiaires,
  trackNavigation,
}: OngletAgendaConseillerProps) {
  const router = useRouter()
  const [rdvs, setRdvs] = useState<EvenementListItem[]>()
  const [periode, setPeriode] = useState<{ debut: DateTime; fin: DateTime }>()

  async function chargerRdvs(dateDebut: DateTime, dateFin: DateTime) {
    setRdvs(undefined)

    const deuxiemeJour = dateDebut.plus({ day: 1 }).endOf('day')

    const evenements = await recupererRdvs(
      conseiller.id,
      dateDebut,
      deuxiemeJour
    )

    let sessions: EvenementListItem[] = []
    if (peutAccederAuxSessions(conseiller)) {
      try {
        sessions = await recupererSessionsBeneficiaires(
          conseiller.id,
          dateDebut,
          deuxiemeJour
        )
      } catch (e) {
        if (e instanceof ApiError && e.statusCode === 401) {
          await router.push('/api/auth/federated-logout')
        }
        throw e
      }
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
    setPeriode({ debut: dateDebut, fin: dateFin })
  }

  return (
    <>
      <SelecteurPeriode
        onNouvellePeriode={chargerRdvs}
        nombreJours={7}
        trackNavigation={trackNavigation}
      />

      {!rdvs && <SpinningLoader />}

      {rdvs && periode && (
        <TableauRdvsConseiller
          idConseiller={conseiller.id}
          rdvs={rdvs}
          periode={periode}
        />
      )}
    </>
  )
}

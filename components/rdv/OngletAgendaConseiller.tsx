import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'

import EmptyState from 'components/EmptyState'
import { AgendaData, buildAgendaData } from 'components/rdv/AgendaRows'
import TableauEvenementsConseiller from 'components/rdv/TableauEvenementsConseiller'
import { IllustrationName } from 'components/ui/IllustrationComponent'
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
  const [agendaEvenements, setAgendaEvenements] =
    useState<AgendaData<EvenementListItem>>()
  const [failed, setFailed] = useState<boolean>(false)

  async function chargerNouvellePeriode(
    nouvellePeriodeIndex: number,
    dateDebut: DateTime,
    dateFin: DateTime
  ) {
    await initEvenementsPeriode(dateDebut, dateFin)
    changerPeriode(nouvellePeriodeIndex)
  }

  async function initEvenementsPeriode(dateDebut: DateTime, dateFin: DateTime) {
    setFailed(false)
    setAgendaEvenements(undefined)

    try {
      const evenementsPeriode = await chargerEvenements(dateDebut, dateFin)
      setEvenements(evenementsPeriode)
    } catch (e) {
      setFailed(true)
    } finally {
      setPeriode({ debut: dateDebut, fin: dateFin })
    }
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
    if (evenements && periode) {
      setAgendaEvenements(
        buildAgendaData(evenements, periode, ({ date }) =>
          DateTime.fromISO(date)
        )
      )
    }
  }, [evenements, periode])

  return (
    <>
      <SelecteurPeriode
        onNouvellePeriode={chargerNouvellePeriode}
        periodeCourante={periodeIndex}
        nombreJours={7}
        trackNavigation={trackNavigation}
      />

      {!agendaEvenements && !failed && (
        <EmptyState
          illustrationName={IllustrationName.Sablier}
          titre='L’affichage de votre agenda peut prendre quelques instants.'
          sousTitre='Veuillez patienter pendant le chargement des informations.'
        />
      )}

      {!agendaEvenements && failed && (
        <EmptyState
          illustrationName={IllustrationName.Maintenance}
          titre='L’affichage de votre agenda a échoué.'
          sousTitre='Si le problème persiste, contactez notre support.'
          bouton={{
            onClick: () => initEvenementsPeriode(periode!.debut, periode!.fin),
            label: 'Réessayer',
          }}
        />
      )}

      {agendaEvenements && (
        <TableauEvenementsConseiller
          idConseiller={conseiller.id}
          agendaEvenements={agendaEvenements}
        />
      )}
    </>
  )
}

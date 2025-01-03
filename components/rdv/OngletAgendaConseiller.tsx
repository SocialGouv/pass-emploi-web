import { DateTime } from 'luxon'
import React, { useEffect, useRef, useState } from 'react'

import EmptyState from 'components/EmptyState'
import TableauEvenementsConseiller from 'components/rdv/TableauEvenementsConseiller'
import { IconName } from 'components/ui/IconComponent'
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
  const tableRef = useRef<HTMLTableElement>(null)

  const [evenements, setEvenements] = useState<EvenementListItem[]>()
  const [shouldFocus, setShouldFocus] = useState<boolean>(false)

  const [periode, setPeriode] = useState<{ debut: DateTime; fin: DateTime }>()
  const [labelPeriode, setLabelPeriode] = useState<string>()
  const [failed, setFailed] = useState<boolean>(false)

  async function chargerNouvellePeriode(
    nouvellePeriode: { index: number; dateDebut: DateTime; dateFin: DateTime },
    opts: { label: string; shouldFocus: boolean }
  ) {
    await initEvenementsPeriode(
      nouvellePeriode.dateDebut,
      nouvellePeriode.dateFin
    )
    setLabelPeriode(opts.label)
    changerPeriode(nouvellePeriode.index)
    setShouldFocus(opts.shouldFocus)
  }

  async function initEvenementsPeriode(dateDebut: DateTime, dateFin: DateTime) {
    setFailed(false)

    try {
      const evenementsPeriode = await chargerEvenements(dateDebut, dateFin)
      setEvenements(evenementsPeriode)
    } catch {
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
    if (shouldFocus) tableRef.current?.focus()
  }, [evenements])

  return (
    <>
      <SelecteurPeriode
        onNouvellePeriode={chargerNouvellePeriode}
        periodeCourante={periodeIndex}
        trackNavigation={trackNavigation}
      />

      {!evenements && !failed && (
        <EmptyState
          illustrationName={IllustrationName.Sablier}
          titre='L’affichage de votre agenda peut prendre quelques instants.'
          sousTitre='Veuillez patienter pendant le chargement des informations.'
        />
      )}

      {!evenements && failed && (
        <EmptyState
          shouldFocus={shouldFocus}
          illustrationName={IllustrationName.Maintenance}
          titre='L’affichage de votre agenda a échoué.'
          sousTitre='Si le problème persiste, contactez notre support.'
          bouton={{
            onClick: () => initEvenementsPeriode(periode!.debut, periode!.fin),
            label: 'Réessayer',
          }}
        />
      )}

      {evenements?.length === 0 && (
        <EmptyState
          shouldFocus={shouldFocus}
          illustrationName={IllustrationName.Checklist}
          titre='Vous n’avez aucun événement dans votre agenda sur cette période.'
          lien={{
            href: '/mes-jeunes/edition-rdv',
            label: 'Créer un rendez-vous',
            iconName: IconName.Add,
          }}
        />
      )}

      {evenements && evenements.length > 0 && (
        <TableauEvenementsConseiller
          ref={tableRef}
          evenements={evenements}
          periodeLabel={labelPeriode!}
        />
      )}
    </>
  )
}

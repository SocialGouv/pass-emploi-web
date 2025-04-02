import { DateTime } from 'luxon'
import React, { useEffect, useRef, useState } from 'react'

import EmptyState from 'components/EmptyState'
import TableauEvenementsConseiller from 'components/rdv/TableauEvenementsConseiller'
import { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import { SelecteurPeriode } from 'components/ui/SelecteurPeriode'
import { Conseiller, peutAccederAuxSessions } from 'interfaces/conseiller'
import { EvenementListItem } from 'interfaces/evenement'
import { Periode } from 'types/dates'
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
  debutPeriode: DateTime
  changerPeriode: (nouveauDebut: DateTime) => void
}

export default function OngletAgendaConseiller({
  conseiller,
  recupererRdvs,
  recupererSessionsBeneficiaires,
  trackNavigation,
  debutPeriode,
  changerPeriode,
}: OngletAgendaConseillerProps) {
  const tableRef = useRef<HTMLTableElement>(null)

  const [evenements, setEvenements] = useState<EvenementListItem[]>()
  const [shouldFocus, setShouldFocus] = useState<boolean>(false)

  const [periode, setPeriode] = useState<Periode>()
  const [failed, setFailed] = useState<string>()

  async function chargerNouvellePeriode(
    nouvellePeriode: Periode,
    opts: { shouldFocus: boolean }
  ) {
    await initEvenementsPeriode(nouvellePeriode)
    setShouldFocus(opts.shouldFocus)
    changerPeriode(nouvellePeriode.debut)
  }

  async function initEvenementsPeriode(nouvellePeriode: Periode) {
    const evenementsPeriode = await chargerEvenements(
      nouvellePeriode.debut,
      nouvellePeriode.fin
    )
    setEvenements(evenementsPeriode)
    setPeriode(nouvellePeriode)
  }

  async function chargerEvenements(
    dateDebut: DateTime,
    dateFin: DateTime
  ): Promise<EvenementListItem[]> {
    setFailed(undefined)
    let erreurs

    let rdvs: EvenementListItem[] = []
    try {
      rdvs = await recupererRdvs(conseiller.id, dateDebut, dateFin)
    } catch {
      erreurs = 'rdvs'
    }

    let sessions: EvenementListItem[] = []
    if (peutAccederAuxSessions(conseiller)) {
      try {
        sessions = await recupererSessionsBeneficiaires(
          conseiller.id,
          dateDebut,
          dateFin
        )
      } catch {
        erreurs = erreurs ? 'all' : 'sessions'
      }
    }

    setFailed(erreurs)
    return [...rdvs, ...sessions].sort((event1, event2) =>
      compareDates(DateTime.fromISO(event1.date), DateTime.fromISO(event2.date))
    )
  }

  useEffect(() => {
    if (shouldFocus) tableRef.current?.focus()
  }, [evenements])

  return (
    <>
      <SelecteurPeriode
        premierJour={debutPeriode}
        jourSemaineReference={DateTime.now().weekday}
        onNouvellePeriode={chargerNouvellePeriode}
        trackNavigation={trackNavigation}
      />

      {!evenements && !failed && (
        <EmptyState
          illustrationName={IllustrationName.Sablier}
          titre='L’affichage de votre agenda peut prendre quelques instants.'
          sousTitre='Veuillez patienter pendant le chargement des informations.'
        />
      )}

      <ErreursRecuperation
        failed={failed}
        shouldFocus={shouldFocus}
        onRetry={() => initEvenementsPeriode(periode!)}
      />

      {failed !== 'all' && evenements?.length === 0 && (
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
          labelPeriode={periode!.label}
        />
      )}
    </>
  )
}

function ErreursRecuperation({
  failed,
  shouldFocus,
  onRetry,
}: {
  failed: string | undefined
  shouldFocus: boolean
  onRetry: () => Promise<void>
}) {
  const labelContactSupport =
    'Si le problème persiste, contactez notre support.'

  switch (failed) {
    case 'rdvs':
      return (
        <FailureAlert
          label='La récupération de vos rendez-vous a échoué.'
          className='mt-4'
        >
          <p className='pl-8'>{labelContactSupport}</p>
        </FailureAlert>
      )

    case 'sessions':
      return (
        <FailureAlert
          label='La récupération de vos sessions depuis i-milo a échoué.'
          className='mt-4'
        >
          <p className='pl-8'>{labelContactSupport}</p>
        </FailureAlert>
      )

    case 'all':
      return (
        <EmptyState
          shouldFocus={shouldFocus}
          illustrationName={IllustrationName.Maintenance}
          titre='L’affichage de votre agenda a échoué.'
          sousTitre={labelContactSupport}
          bouton={{
            onClick: onRetry,
            label: 'Réessayer',
          }}
        />
      )

    default:
      return null
  }
}

import { DateTime, Interval } from 'luxon'
import React, { useEffect, useState } from 'react'

import { EntreesAgendaParJourDeLaSemaine } from 'components/agenda-jeune/EntreesAgendaParJourDeLaSemaine'
import { IntegrationPoleEmploi } from 'components/jeune/IntegrationPoleEmploi'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import { Agenda, AgendaMetadata, EntreeAgenda } from 'interfaces/agenda'
import { toFrenchFormat, WEEKDAY_MONTH_LONG } from 'utils/date'

interface OngletAgendaBeneficiaireProps {
  idBeneficiaire: string
  isPoleEmploi: boolean
  recupererAgenda: () => Promise<Agenda>
}

export function OngletAgendaBeneficiaire({
  idBeneficiaire,
  isPoleEmploi,
  recupererAgenda,
}: OngletAgendaBeneficiaireProps) {
  const [joursSemaineEnCours, setJoursSemaineEnCours] = useState<
    Array<DateTime>
  >([])
  const [joursSemaineSuivante, setJoursSemaineSuivante] = useState<
    Array<DateTime>
  >([])

  const [entreesSemaineEnCours, setEntreesSemaineEnCours] = useState<
    Array<EntreeAgenda>
  >([])
  const [entreesSemaineSuivante, setEntreesSemaineSuivante] = useState<
    Array<EntreeAgenda>
  >([])

  const [metadata, setMetadata] = useState<AgendaMetadata>()

  useEffect(() => {
    if (!isPoleEmploi) {
      recupererAgenda().then((agenda) => {
        const semaineEnCours = getSemaineEnCours(agenda.metadata)
        const semaineSuivante = getSemaineSuivante(agenda.metadata)
        const entreeDeLaSemaineEnCours = agenda.entrees.filter((entree) =>
          semaineEnCours.contains(entree.date)
        )
        const entreesDeLaSemaineSuivante = agenda.entrees.filter((entree) =>
          semaineSuivante.contains(entree.date)
        )
        setJoursSemaineEnCours(
          joursAPrendreEnCompte(semaineEnCours, entreeDeLaSemaineEnCours)
        )
        setJoursSemaineSuivante(
          joursAPrendreEnCompte(semaineSuivante, entreesDeLaSemaineSuivante)
        )
        setEntreesSemaineEnCours(entreeDeLaSemaineEnCours)
        setEntreesSemaineSuivante(entreesDeLaSemaineSuivante)
        setMetadata(agenda.metadata)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {isPoleEmploi && (
        <IntegrationPoleEmploi label='convocations et démarches' />
      )}

      {!isPoleEmploi && !metadata && <SpinningLoader />}

      {!isPoleEmploi && metadata && (
        <div>
          <section aria-labelledby='semaine-en-cours'>
            <h2 id='semaine-en-cours' className='text-m-bold text-primary mb-6'>
              Semaine en cours
            </h2>

            {entreesSemaineEnCours.length === 0 && (
              <AucuneEntreeDansLaSemaine periode={getLibelleSemaineEnCours()} />
            )}

            {entreesSemaineEnCours.length > 0 && (
              <EntreesAgendaParJourDeLaSemaine
                idBeneficiaire={idBeneficiaire}
                numeroSemaine={0}
                jours={joursSemaineEnCours}
                entrees={entreesSemaineEnCours}
              />
            )}
          </section>

          <section aria-labelledby='semaine-suivante' className='mt-6'>
            <h2 id='semaine-suivante' className='text-m-bold text-primary mb-6'>
              Semaine suivante
            </h2>

            {entreesSemaineSuivante.length === 0 && (
              <AucuneEntreeDansLaSemaine
                periode={getLibelleSemaineSuivante()}
              />
            )}

            {entreesSemaineSuivante.length > 0 && (
              <EntreesAgendaParJourDeLaSemaine
                idBeneficiaire={idBeneficiaire}
                numeroSemaine={1}
                jours={joursSemaineSuivante}
                entrees={entreesSemaineSuivante}
              />
            )}
          </section>
        </div>
      )}
    </>
  )
}

function AucuneEntreeDansLaSemaine({ periode }: { periode: string }) {
  return (
    <div className='rounded-small border border-grey_100 p-4'>
      <p className='text-base-medium mb-2'>{periode}</p>
      <p className='text-grey_800'>Pas d’action ni de rendez-vous</p>
    </div>
  )
}

function joursAPrendreEnCompte(
  interval: Interval,
  entrees: EntreeAgenda[]
): DateTime[] {
  const jours: DateTime[] = []
  let jourCourant = interval.start
  while (jourCourant < interval.end) {
    jours.push(jourCourant)
    jourCourant = jourCourant.plus({ days: 1 })
  }

  const dateDeLaPremiereEntree = entrees[0]?.date
  let indexDuPremierJour: number
  if (estSamedi(dateDeLaPremiereEntree) && estSamedi(jours[0])) {
    indexDuPremierJour = 0
  } else if (estDimanche(dateDeLaPremiereEntree) && estDimanche(jours[1])) {
    indexDuPremierJour = 1
  } else {
    indexDuPremierJour = 2
  }
  return jours.slice(indexDuPremierJour)
}

let estSamedi = (date?: DateTime) => date?.weekday == 6

let estDimanche = (date?: DateTime) => date?.weekday == 7

function getSemaineEnCours(metadata: AgendaMetadata): Interval {
  return Interval.fromDateTimes(
    metadata.dateDeDebut,
    metadata.dateDeDebut.plus({ week: 1 })
  )
}

function getSemaineSuivante(metadata: AgendaMetadata): Interval {
  return Interval.fromDateTimes(
    metadata.dateDeDebut.plus({ week: 1 }),
    metadata.dateDeFin
  )
}

function getLibelleSemaineEnCours(): string {
  const maintenant = DateTime.now()
  const lundi = maintenant.startOf('week')
  const vendredi = lundi.plus({ day: 4 })
  return `Du ${toFrenchFormat(lundi, WEEKDAY_MONTH_LONG)} au ${toFrenchFormat(
    vendredi,
    WEEKDAY_MONTH_LONG
  )}`
}

function getLibelleSemaineSuivante(): string {
  const maintenant = DateTime.now()
  const lundiSuivant = maintenant.plus({ week: 1 }).startOf('week')
  const vendrediSuivant = lundiSuivant.plus({ day: 4 })
  return `Du ${toFrenchFormat(
    lundiSuivant,
    WEEKDAY_MONTH_LONG
  )} au ${toFrenchFormat(vendrediSuivant, WEEKDAY_MONTH_LONG)}`
}

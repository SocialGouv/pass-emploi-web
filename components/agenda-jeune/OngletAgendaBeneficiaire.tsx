import { DateTime, Interval } from 'luxon'
import React, { useEffect, useState } from 'react'

import AgendaRow from 'components/agenda-jeune/AgendaRow'
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
        setEntreesSemaineEnCours(
          agenda.entrees.filter((entree) =>
            semaineEnCours.contains(entree.date)
          )
        )
        setEntreesSemaineSuivante(
          agenda.entrees.filter((entree) =>
            semaineSuivante.contains(entree.date)
          )
        )
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
              <AucuneEntree periode={getLibelleSemaineEnCours()} />
            )}

            {entreesSemaineEnCours.length > 0 && (
              <ol>
                {entreesSemaineEnCours.map((entree) => (
                  <AgendaRow
                    key={entree.id}
                    entree={entree}
                    jeuneId={idBeneficiaire}
                  />
                ))}
              </ol>
            )}
          </section>

          <section aria-labelledby='semaine-suivante' className='mt-6'>
            <h2 id='semaine-suivante' className='text-m-bold text-primary mb-6'>
              Semaine suivante
            </h2>

            {entreesSemaineSuivante.length === 0 && (
              <AucuneEntree periode={getLibelleSemaineSuivante()} />
            )}

            {entreesSemaineSuivante.length > 0 && (
              <ol>
                {entreesSemaineSuivante.map((entree) => (
                  <AgendaRow
                    key={entree.id}
                    entree={entree}
                    jeuneId={idBeneficiaire}
                  />
                ))}
              </ol>
            )}
          </section>
        </div>
      )}
    </>
  )
}

function AucuneEntree(props: { periode: string }) {
  return (
    <div className='rounded-small p-4 border border-grey_100'>
      <p className='text-base-medium'>{props.periode}</p>
      <p className='text-grey_700'>Pas d’action ni de rendez-vous</p>
    </div>
  )
}

function getSemaineEnCours(metadata: AgendaMetadata): Interval {
  return Interval.fromDateTimes(
    metadata.dateDeDebut,
    metadata.dateDeDebut.plus({ week: 1 })
  )
}

function getSemaineSuivante(metadata: AgendaMetadata): Interval {
  return Interval.fromDateTimes(
    metadata.dateDeDebut.plus({ week: 1, day: 1 }),
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

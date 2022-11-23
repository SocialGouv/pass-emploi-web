import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'

import {
  EntreesAgendaParJourDeLaSemaine,
  SemaineAgenda,
} from 'components/agenda-jeune/EntreesAgendaParJourDeLaSemaine'
import { IntegrationPoleEmploi } from 'components/jeune/IntegrationPoleEmploi'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import { Agenda, EntreeAgenda } from 'interfaces/agenda'
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
  const [semaines, setSemaines] = useState<{
    courante: SemaineAgenda
    suivante: SemaineAgenda
  }>()

  useEffect(() => {
    if (!isPoleEmploi) {
      recupererAgenda().then(
        ({ entrees, metadata: { dateDeDebut, dateDeFin } }) => {
          const { courante, suivante, separation } = preparerSemaines(
            dateDeDebut,
            dateDeFin
          )

          entrees.forEach((entree) => {
            const semaine = entree.date < separation ? courante : suivante
            semaine.jours[toFrenchFulldate(entree.date)].entrees.push(entree)
            semaine.aEvenement = true
            if (entree.date.weekday === 6) semaine.afficherSamedi = true
            if (entree.date.weekday === 7) semaine.afficherDimanche = true
          })

          setSemaines({ courante, suivante })
        }
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {isPoleEmploi && (
        <IntegrationPoleEmploi label='convocations et démarches' />
      )}

      {!isPoleEmploi && !semaines && <SpinningLoader />}

      {!isPoleEmploi && semaines && (
        <>
          <section aria-labelledby='semaine-en-cours'>
            <h2 id='semaine-en-cours' className='text-m-bold text-primary mb-6'>
              Semaine en cours
            </h2>

            {!semaines.courante.aEvenement && (
              <AucuneEntreeDansLaSemaine periode={getLibelleSemaineEnCours()} />
            )}

            {semaines.courante.aEvenement && (
              <EntreesAgendaParJourDeLaSemaine
                idBeneficiaire={idBeneficiaire}
                numeroSemaine={0}
                semaine={semaines.courante}
              />
            )}
          </section>

          <section aria-labelledby='semaine-suivante' className='mt-6'>
            <h2 id='semaine-suivante' className='text-m-bold text-primary mb-6'>
              Semaine suivante
            </h2>

            {!semaines.suivante.aEvenement && (
              <AucuneEntreeDansLaSemaine
                periode={getLibelleSemaineSuivante()}
              />
            )}

            {semaines.suivante.aEvenement && (
              <EntreesAgendaParJourDeLaSemaine
                idBeneficiaire={idBeneficiaire}
                numeroSemaine={1}
                semaine={semaines.suivante}
              />
            )}
          </section>
        </>
      )}
    </>
  )
}

function preparerSemaines(
  dateDeDebut: DateTime,
  dateDeFin: DateTime
): {
  courante: SemaineAgenda
  suivante: SemaineAgenda
  separation: DateTime
} {
  const { courante, suivante } = {
    courante: {
      jours: {} as {
        [jour: string]: { date: DateTime; entrees: EntreeAgenda[] }
      },
      aEvenement: false,
      afficherSamedi: false,
      afficherDimanche: false,
    },
    suivante: {
      jours: {} as {
        [jour: string]: { date: DateTime; entrees: EntreeAgenda[] }
      },
      aEvenement: false,
      afficherSamedi: false,
      afficherDimanche: false,
    },
  }
  const separation = dateDeDebut.plus({ week: 1 })
  for (let date = dateDeDebut; date < dateDeFin; date = date.plus({ day: 1 })) {
    const semaine = date < separation ? courante : suivante
    semaine.jours[toFrenchFulldate(date)] = { date, entrees: [] }
  }
  return { courante, suivante, separation }
}

function AucuneEntreeDansLaSemaine({ periode }: { periode: string }) {
  return (
    <div className='rounded-small border border-grey_100 p-4'>
      <p className='text-base-medium mb-2'>{periode}</p>
      <p className='text-grey_800'>Pas d’action ni de rendez-vous</p>
    </div>
  )
}

function getLibelleSemaineEnCours(): string {
  const maintenant = DateTime.now()
  const lundi = maintenant.startOf('week')
  const vendredi = lundi.plus({ day: 4 })
  return `Du ${toFrenchFulldate(lundi)} au ${toFrenchFormat(
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
  )} au ${toFrenchFulldate(vendrediSuivant)}`
}

function toFrenchFulldate(date: DateTime) {
  return toFrenchFormat(date, WEEKDAY_MONTH_LONG)
}

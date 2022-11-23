import { DateTime } from 'luxon'
import React from 'react'

import AgendaRow from 'components/agenda-jeune/AgendaRow'
import { EntreeAgenda } from 'interfaces/agenda'

export type SemaineAgenda = {
  jours: { [jour: string]: { date: DateTime; entrees: EntreeAgenda[] } }
  aEvenement: boolean
  afficherSamedi: boolean
  afficherDimanche: boolean
}

type EntreesAgendaParJourDeLaSemaineProps = {
  idBeneficiaire: string
  numeroSemaine: number
  semaine: SemaineAgenda
}
export function EntreesAgendaParJourDeLaSemaine({
  idBeneficiaire,
  numeroSemaine,
  semaine,
}: EntreesAgendaParJourDeLaSemaineProps) {
  function afficherDate(date: DateTime) {
    if (semaine.afficherSamedi) return true
    if (semaine.afficherDimanche && date.weekday === 7) return true
    return date.weekday <= 5
  }

  return (
    <>
      {Object.entries(semaine.jours).map(([jour, { date, entrees }], index) => {
        if (afficherDate(date))
          return (
            <section
              key={`semaine-${numeroSemaine}-jour-${index}`}
              aria-labelledby={`semaine-${numeroSemaine}-jour-${index}`}
              className='rounded-small border border-grey_100 p-4 mt-6'
            >
              <h3
                id={`semaine-${numeroSemaine}-jour-${index}`}
                className='text-base-medium mb-2'
              >
                {capitalizeFirstLetter(jour)}
              </h3>
              {entrees.length === 0 && (
                <p className='text-grey_800'>Pas d’action ni de rendez-vous</p>
              )}
              {entrees.length > 0 && (
                <ol>
                  {entrees.map((entree) => (
                    <AgendaRow
                      key={entree.id}
                      entree={entree}
                      jeuneId={idBeneficiaire}
                    />
                  ))}
                </ol>
              )}
            </section>
          )
      })}
    </>
  )
}

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

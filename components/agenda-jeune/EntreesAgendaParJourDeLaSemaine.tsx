import { DateTime } from 'luxon'
import React from 'react'

import AgendaRow from 'components/agenda-jeune/AgendaRow'
import { EntreeAgenda } from 'interfaces/agenda'
import { toFrenchFormat, WEEKDAY_MONTH_LONG } from 'utils/date'

interface EntreesAgendaParJourDeLaSemaineProps {
  idBeneficiaire: string
  numeroSemaine: number
  jours: DateTime[]
  entrees: EntreeAgenda[]
}

export function EntreesAgendaParJourDeLaSemaine({
  idBeneficiaire,
  numeroSemaine,
  jours,
  entrees,
}: EntreesAgendaParJourDeLaSemaineProps) {
  return (
    <>
      {jours.map((jour, index) => {
        const entreesDuJour = entrees.filter((entree) =>
          jour.hasSame(entree.date, 'day')
        )
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
              {capitalizeFirstLetter(toFrenchFormat(jour, WEEKDAY_MONTH_LONG))}
            </h3>
            {entreesDuJour.length === 0 && (
              <p className='text-grey_800'>Pas d’action ni de rendez-vous</p>
            )}
            {entreesDuJour.length > 0 && (
              <ol>
                {entreesDuJour.map((entree) => (
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

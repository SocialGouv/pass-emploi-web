import React from 'react'

import AgendaRow from 'components/agenda-jeune/AgendaRow'
import { EntreeAgenda } from 'interfaces/agenda'

export type SemaineAgenda = {
  jours: { [jour: string]: { entrees: EntreeAgenda[] } }
  aEvenement: boolean
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
  return (
    <>
      {Object.entries(semaine.jours).map(([jour, { entrees }], index) => {
        return (
          <section
            key={`semaine-${numeroSemaine}-jour-${index}`}
            aria-labelledby={`semaine-${numeroSemaine}-jour-${index}`}
            className='rounded-base border border-grey-100 p-4 mt-6'
          >
            <h3
              id={`semaine-${numeroSemaine}-jour-${index}`}
              className='text-base-medium mb-2'
            >
              {capitalizeFirstLetter(jour)}
            </h3>
            {entrees.length === 0 && (
              <p className='text-grey-800'>Pas d’action ni de rendez-vous</p>
            )}
            {entrees.length > 0 && (
              <ol>
                {entrees.map((entree) => (
                  <AgendaRow
                    key={entree.id}
                    entree={entree}
                    idBeneficiaire={idBeneficiaire}
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

import { DateTime } from 'luxon'
import React from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { Intercalaire } from 'components/ui/Table/Intercalaire'
import {
  AUJOURDHUI_LABEL,
  formatJourIfToday,
  isApresMidi,
  isMatin,
} from 'utils/date'

export const PLAGE_HORAIRE_MATIN = 'Matin'
export const PLAGE_HORAIRE_APRES_MIDI = 'Après-midi'

export type AgendaData<T> = {
  [jourISO: string]:
    | {
        matin: T[]
        apresMidi: T[]
      }
    | undefined
}

export function buildAgenda<T>(
  elements: T[],
  periode: { debut: DateTime; fin: DateTime },
  extractDate: (element: T) => DateTime
): AgendaData<T> {
  const agenda: AgendaData<T> = {}
  const premierJour = periode.debut.startOf('day')
  const dernierJour = periode.fin.startOf('day')
  for (
    let jourCourant = premierJour;
    jourCourant <= dernierJour;
    jourCourant = jourCourant.plus({ day: 1 })
  ) {
    agenda[jourCourant.toISODate()] = undefined
  }

  elements.forEach((element) => {
    const datetime = extractDate(element)
    const jour = datetime.toISODate()
    if (!agenda[jour]) agenda[jour] = { matin: [], apresMidi: [] }

    if (isMatin(datetime.hour)) agenda[jour]!.matin.push(element)
    if (isApresMidi(datetime.hour)) agenda[jour]!.apresMidi.push(element)
  })

  return agenda
}

export function renderAgenda<T>(
  agenda: AgendaData<T>,
  renderEvenement: (item: T) => React.JSX.Element,
  renderFiller: (jour: string) => React.JSX.Element
): React.JSX.Element[] {
  const renders: React.JSX.Element[] = []

  Object.keys(agenda).forEach((jour, index) => {
    const evenementsJour = agenda[jour]

    if (evenementsJour) {
      renders.push(intercalaireDate(jour, index))

      if (evenementsJour.matin.length) {
        renders.push(
          intercalairePlageHoraire({ label: PLAGE_HORAIRE_MATIN, jour })
        )
        renders.push(...evenementsJour.matin.map(renderEvenement))
      }

      if (evenementsJour.apresMidi.length) {
        renders.push(
          intercalairePlageHoraire({ label: PLAGE_HORAIRE_APRES_MIDI, jour })
        )
        renders.push(...evenementsJour.apresMidi.map(renderEvenement))
      }
    } else if (renderFiller) {
      renders.push(intercalaireDate(jour, index))
      renders.push(
        <Intercalaire key={'filler-' + jour}>
          <Button
            style={ButtonStyle.SECONDARY}
            disabled={true}
            className='m-auto'
          >
            Afficher l’agenda du jour
          </Button>
        </Intercalaire>
      )
    }
  })

  return renders
}

function intercalaireDate(jour: string, index: number) {
  const label = formatJourIfToday(DateTime.fromISO(jour))
  return (
    <Intercalaire
      key={jour}
      className={`text-m-bold capitalize whitespace-nowrap pl-4 ${
        index > 0 ? 'pt-6' : ''
      } ${label === AUJOURDHUI_LABEL ? 'text-primary' : 'text-content_color'} `}
    >
      {label}
    </Intercalaire>
  )
}

function intercalairePlageHoraire({
  label,
  jour,
}: {
  label: string
  jour: string
}) {
  return (
    <Intercalaire key={`${label}-${jour}`} className='text-s-bold pl-4'>
      {label}
    </Intercalaire>
  )
}

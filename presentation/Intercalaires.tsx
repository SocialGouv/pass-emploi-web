import { DateTime } from 'luxon'
import React from 'react'

import { Intercalaire } from 'components/ui/Table/Intercalaire'
import {
  compareDates,
  dateIsToday,
  toFrenchFormat,
  WEEKDAY_MONTH_LONG,
} from 'utils/date'

export const AUJOURDHUI_LABEL = 'aujourd’hui'
export const PLAGE_HORAIRE_MATIN = 'Matin'
export const PLAGE_HORAIRE_APRES_MIDI = 'Après-midi'

export class IntercalaireJour {
  constructor(readonly label: string) {}
}

export class IntercalairePlageHoraire {
  constructor(readonly label: string, readonly jour: string) {}
}

export type ItemOuIntercalaire<T> =
  | T
  | IntercalaireJour
  | IntercalairePlageHoraire

export function insertIntercalaires<T>(
  listeBase: T[],
  extractDate: (item: T) => DateTime
): Array<ItemOuIntercalaire<T>> {
  const listeTriee = [...listeBase].sort((item1, item2) =>
    compareDates(extractDate(item1), extractDate(item2))
  )
  const listeAvecIntercalaires: ItemOuIntercalaire<T>[] = []
  let dernierJour = ''
  let dernierePlageHoraireDefinie = ''
  for (const item of listeTriee) {
    const date = extractDate(item)
    const jour = extractJourFormate(date)
    const heure = date.hour

    if (jour !== dernierJour) {
      dernierJour = jour
      listeAvecIntercalaires.push(new IntercalaireJour(jour))
      dernierePlageHoraireDefinie = ''
    }

    if (isMatin(heure) && dernierePlageHoraireDefinie !== PLAGE_HORAIRE_MATIN) {
      listeAvecIntercalaires.push(
        new IntercalairePlageHoraire(PLAGE_HORAIRE_MATIN, dernierJour)
      )
      dernierePlageHoraireDefinie = PLAGE_HORAIRE_MATIN
    }

    if (
      isApresMidi(heure) &&
      dernierePlageHoraireDefinie !== PLAGE_HORAIRE_APRES_MIDI
    ) {
      listeAvecIntercalaires.push(
        new IntercalairePlageHoraire(PLAGE_HORAIRE_APRES_MIDI, dernierJour)
      )
      dernierePlageHoraireDefinie = PLAGE_HORAIRE_APRES_MIDI
    }

    listeAvecIntercalaires.push(item)
  }
  return listeAvecIntercalaires
}

export function renderListeWithIntercalaires<T>(
  liste: ItemOuIntercalaire<T>[],
  renderItem: (item: T) => JSX.Element
): JSX.Element[] {
  return liste.map((item) => {
    if (item instanceof IntercalaireJour) return intercalaireDate(item)
    if (item instanceof IntercalairePlageHoraire)
      return intercalairePlageHoraire(item)
    return renderItem(item)
  })
}

function extractJourFormate(date: DateTime): string {
  return dateIsToday(date)
    ? AUJOURDHUI_LABEL
    : toFrenchFormat(date, WEEKDAY_MONTH_LONG)
}

function isMatin(heure: number) {
  return heure <= 12
}

function isApresMidi(heure: number) {
  return heure > 12
}

function intercalaireDate({ label }: IntercalaireJour) {
  return (
    <Intercalaire
      key={label}
      className={`text-m-bold capitalize ${
        label === AUJOURDHUI_LABEL ? 'text-primary' : 'text-content_color'
      } `}
    >
      {label}
    </Intercalaire>
  )
}

function intercalairePlageHoraire({ label, jour }: IntercalairePlageHoraire) {
  return (
    <Intercalaire key={`${label}-${jour}`} className='text-s-bold'>
      {label}
    </Intercalaire>
  )
}

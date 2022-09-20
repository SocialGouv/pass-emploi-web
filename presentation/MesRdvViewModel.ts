import { DateTime } from 'luxon'

import { RdvListItem } from 'interfaces/rdv'
import { dateIsToday, toFrenchFormat, WEEKDAY_MONTH_LONG } from 'utils/date'

export const AUJOURDHUI_LABEL = 'aujourd’hui'
export const PLAGE_HORAIRE_MATIN = 'Matin'
export const PLAGE_HORAIRE_APRES_MIDI = 'Après-midi'

export class IntercalaireJour {
  constructor(readonly label: string) {}
}

export class IntercalairePlageHoraire {
  constructor(readonly label: string) {}
}

export function rdvsWithIntercalaires(
  mesRendezVous: RdvListItem[]
): Array<IntercalaireJour | IntercalairePlageHoraire | RdvListItem> {
  const rdvTries = [...mesRendezVous].sort(trierParDate)
  const items: Array<
    IntercalaireJour | IntercalairePlageHoraire | RdvListItem
  > = []
  let dernierJour = ''
  let dernierePlageHoraireDefinie = ''
  for (const rdv of rdvTries) {
    const dateRdv = DateTime.fromISO(rdv.date)
    const jour = jourDuRdvFormate(dateRdv)
    const heureDuRdv = dateRdv.hour

    if (jour !== dernierJour) {
      dernierJour = jour
      items.push(new IntercalaireJour(jour))
      dernierePlageHoraireDefinie = ''
    }

    if (
      isRdvDuMatin(heureDuRdv) &&
      dernierePlageHoraireDefinie !== PLAGE_HORAIRE_MATIN
    ) {
      items.push(new IntercalairePlageHoraire(PLAGE_HORAIRE_MATIN))
      dernierePlageHoraireDefinie = PLAGE_HORAIRE_MATIN
    }

    if (
      isRdvApresMidi(heureDuRdv) &&
      dernierePlageHoraireDefinie !== PLAGE_HORAIRE_APRES_MIDI
    ) {
      items.push(new IntercalairePlageHoraire(PLAGE_HORAIRE_APRES_MIDI))
      dernierePlageHoraireDefinie = PLAGE_HORAIRE_APRES_MIDI
    }

    items.push(rdv)
  }
  return items
}

function jourDuRdvFormate(date: DateTime): string {
  return dateIsToday(date)
    ? AUJOURDHUI_LABEL
    : toFrenchFormat(date, WEEKDAY_MONTH_LONG)
}

function isRdvDuMatin(heureDuRdv: number) {
  return heureDuRdv < 13
}

function isRdvApresMidi(heureDuRdv: number) {
  return heureDuRdv > 12
}

function trierParDate(a: RdvListItem, b: RdvListItem) {
  return (
    DateTime.fromISO(a.date).toMillis() - DateTime.fromISO(b.date).toMillis()
  )
}

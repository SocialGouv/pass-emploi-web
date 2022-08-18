import {
  JourRdvAVenirItem,
  RdvAVenirItem,
  RdvItem,
  RdvListItem,
} from 'interfaces/rdv'
import { dateIsToday, formatWeekdayWithMonth } from 'utils/date'

export function listeRdvAVenirItem(
  mesRendezVous: RdvListItem[]
): RdvAVenirItem[] {
  mesRendezVous.sort(trierParDate)

  const items: RdvAVenirItem[] = []
  let dernierJour = ''
  for (let rdv of mesRendezVous) {
    const jour = jourDuRdvFormate(new Date(rdv.date))
    if (jour !== dernierJour) {
      dernierJour = jour
      items.push(new JourRdvAVenirItem(jour))
    }
    items.push(new RdvItem(rdv))
  }
  return items
}

function jourDuRdvFormate(date: Date): string {
  return dateIsToday(date) ? 'aujourd’hui' : formatWeekdayWithMonth(date)
}

function trierParDate(a: RdvListItem, b: RdvListItem) {
  return new Date(a.date) < new Date(b.date) ? -1 : 1
}

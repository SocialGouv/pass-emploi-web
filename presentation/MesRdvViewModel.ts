import { JourRdvAVenirItem, PlageHoraire, RdvListItem } from 'interfaces/rdv'
import { dateIsToday, formatWeekdayWithMonth } from 'utils/date'

export const AUJOURDHUI_LABEL = 'aujourd’hui'
export const PLAGE_HORAIRE_MATIN = 'matin'
export const PLAGE_HORAIRE_APRES_MIDI = 'après-midi'

export function listeRdvAVenirItem(
  mesRendezVous: RdvListItem[]
): Array<JourRdvAVenirItem | PlageHoraire | RdvListItem> {
  const rdvTries = [...mesRendezVous].sort(trierParDate)
  const items: Array<JourRdvAVenirItem | PlageHoraire | RdvListItem> = []
  let dernierJour = ''
  let dernierePlageHoraireDefini = ''
  for (let rdv of rdvTries) {
    const dateRdv = new Date(rdv.date)
    const jour = jourDuRdvFormate(dateRdv)
    const heureDuRdv = dateRdv.getHours()

    if (jour !== dernierJour) {
      dernierJour = jour
      items.push(new JourRdvAVenirItem(jour))
      dernierePlageHoraireDefini = ''
    }

    if (
      isRdvDuMatin(heureDuRdv) &&
      dernierePlageHoraireDefini !== PLAGE_HORAIRE_MATIN
    ) {
      items.push(new PlageHoraire(PLAGE_HORAIRE_MATIN))
      dernierePlageHoraireDefini = PLAGE_HORAIRE_MATIN
    }

    if (
      isRdvApresMidi(heureDuRdv) &&
      dernierePlageHoraireDefini !== PLAGE_HORAIRE_APRES_MIDI
    ) {
      items.push(new PlageHoraire(PLAGE_HORAIRE_APRES_MIDI))
      dernierePlageHoraireDefini = PLAGE_HORAIRE_APRES_MIDI
    }

    items.push(rdv)
  }
  return items
}

function jourDuRdvFormate(date: Date): string {
  return dateIsToday(date) ? AUJOURDHUI_LABEL : formatWeekdayWithMonth(date)
}

function isRdvDuMatin(heureDuRdv: number) {
  return heureDuRdv < 13
}

function isRdvApresMidi(heureDuRdv: number) {
  return heureDuRdv > 12
}

function trierParDate(a: RdvListItem, b: RdvListItem) {
  return new Date(a.date) < new Date(b.date) ? -1 : 1
}

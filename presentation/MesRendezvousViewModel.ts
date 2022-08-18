import { RdvListItem } from 'interfaces/rdv'
import { formatWeekdayWithMonth } from 'utils/date'

export function mesRendezvousParJour(
  mesRendezvous: RdvListItem[]
): Map<string, RdvListItem[]> {
  const mesRendezvousParJour = new Map<string, RdvListItem[]>()
  if (mesRendezvous.length > 0) {
    const premierRendezvous = mesRendezvous[0]
    const jour: string = formatWeekdayWithMonth(
      new Date(premierRendezvous.date)
    )
    mesRendezvousParJour.set(jour, mesRendezvous)
  }
  return mesRendezvousParJour
}

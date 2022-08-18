import {
  JourRdvAVenirItem,
  RdvAVenirItem,
  RdvItem,
  RdvListItem,
} from 'interfaces/rdv'
import { formatWeekdayWithMonth } from 'utils/date'

export function listeRdvAVenirItem(
  mesRendezVous: RdvListItem[]
): RdvAVenirItem[] {
  const listeRdvAVenirItem: RdvAVenirItem[] = []
  if (mesRendezVous.length > 0) {
    const premierRendezvous = mesRendezVous[0]
    const jour: string = formatWeekdayWithMonth(
      new Date(premierRendezvous.date)
    )
    listeRdvAVenirItem.push(new JourRdvAVenirItem(jour))
    listeRdvAVenirItem.push(new RdvItem(premierRendezvous))
  }
  return listeRdvAVenirItem
}

import { RdvAVenirItem, RdvListItem } from 'interfaces/rdv'
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
    listeRdvAVenirItem.push({ label: jour }, { rdvListItem: premierRendezvous })
  }
  return listeRdvAVenirItem
}

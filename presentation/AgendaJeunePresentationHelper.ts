import { DateTime } from 'luxon'

import { Action } from 'interfaces/action'
import { RdvListItem } from 'interfaces/rdv'
import { compareDates } from 'utils/date'

export function fusionneEtTriActionsEtRendezVous(
  actions: Action[],
  rendezVous: RdvListItem[]
): Array<Action | RdvListItem> {
  const actionsTriables = actions.map((action) => {
    return { ...action, datePourLeTri: DateTime.fromISO(action.dateEcheance) }
  })
  const rendezVousTriables = rendezVous.map((rdv) => {
    return { ...rdv, datePourLeTri: DateTime.fromISO(rdv.date) }
  })
  const result = [...actionsTriables, ...rendezVousTriables].sort(
    (first, second) => compareDates(first.datePourLeTri, second.datePourLeTri)
  )
  return result.map((actionOuRendezvousTriable) => {
    const { datePourLeTri, ...actionOuRendezvous } = actionOuRendezvousTriable
    return actionOuRendezvous
  })
}

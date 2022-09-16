import { DateTime } from 'luxon'

export const now = DateTime.now()
export const datePassee = now.minus({ month: 1 })
export const datePasseeLoin = now.minus({ year: 1 })
export const dateFuture = now.plus({ month: 1 })
export const dateFutureLoin = now.plus({ year: 1 })

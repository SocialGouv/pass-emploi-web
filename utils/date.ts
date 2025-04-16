import { DateTime, Duration } from 'luxon'
import { DateTimeFormatOptions } from 'luxon/src/misc'

import { JourSemaine, Periode } from 'types/dates'

export const LUNDI = 1
export const PERIODE_LENGTH_FULL_DAYS = 7

export function dateIsToday(dateToCheck: DateTime): boolean {
  return DateTime.now().hasSame(dateToCheck, 'day')
}

export function dateIsFuture(dateToCheck: DateTime): boolean {
  return DateTime.now() < dateToCheck
}

export function dateIsYesterday(dateToCheck: DateTime): boolean {
  return DateTime.now().minus({ day: 1 }).hasSame(dateToCheck, 'day')
}

/** 21/06/2023 */
export function toShortDate(date: string | DateTime): string {
  return toFrenchString(date)
}

/** 21 juin 2023 */
export function toLongMonthDate(date: string | DateTime): string {
  return toFrenchString(date, DateTime.DATE_FULL)
}

const WEEKDAY_MONTH_LONG = 'EEEE d MMMM'
/** mercredi 2 juin */
export function toMonthday(date: string | DateTime): string {
  return toFrenchFormat(date, WEEKDAY_MONTH_LONG)
}

const WEEKDAY = 'EEEE d'
/** mercredi 2 */
export function toWeekday(date: string | DateTime): string {
  return toFrenchFormat(date, WEEKDAY)
}

const TIME = "HH':'mm"
const TIME_A11Y = "H 'heure' m"
/** 02h39 (a11y : 2 heure 39) */
export function toFrenchTime(
  date: string | DateTime,
  { a11y }: { a11y: boolean } = { a11y: false }
): string {
  return toFrenchFormat(date, a11y ? TIME_A11Y : TIME)
}

const DATETIME_LONG = `dd/MM/yyyy 'à' ${TIME}`
const DATETIME_LONG_A11Y = `d MMMM yyyy 'à' ${TIME_A11Y}`
/** 02/06/2023 à 02h39 (a11y : 2 juin 2023 à 2h30)  */
export function toFrenchDateTime(
  date: string | DateTime,
  { a11y }: { a11y: boolean } = { a11y: false }
): string {
  if (a11y) return toFrenchFormat(date, DATETIME_LONG_A11Y)
  return toFrenchFormat(date, DATETIME_LONG)
}

export function toRelativeDateTime(
  date: string | DateTime,
  { a11y }: { a11y: boolean } = { a11y: false }
): string {
  if (!date) return ''

  const dateTime = date instanceof DateTime ? date : DateTime.fromISO(date)
  let dateString: string
  if (dateIsToday(dateTime)) {
    dateString = 'Aujourd’hui'
  } else if (dateIsYesterday(dateTime)) {
    dateString = 'Hier'
  } else {
    dateString = `Le ${a11y ? toLongMonthDate(dateTime) : toShortDate(dateTime)}`
  }

  return `${dateString} à ${toFrenchTime(dateTime, { a11y })}`
}

export function compareDates(
  date1: DateTime | undefined,
  date2: DateTime | undefined
): number {
  return (date1?.toMillis() ?? 0) - (date2?.toMillis() ?? 0)
}

export function compareDatesDesc(
  date1: DateTime | undefined,
  date2: DateTime | undefined
): number {
  return -compareDates(date1, date2)
}

export function dateIsInInterval(
  date: DateTime,
  dateMin: DateTime,
  dateMax: DateTime
) {
  return Boolean(date > dateMin && date < dateMax)
}

export function minutesEntreDeuxDates(
  date1: DateTime,
  date2: DateTime
): number {
  const diff = date1.diff(date2).as('minutes')
  return Math.abs(Math.round(diff))
}

const DURATION_H_SEPARATOR = "h'h'mm"
const DURATION_A11Y_SEPARATOR = "h 'heure' m"
export function toFrenchDuration(
  durationInMinutes: number,
  { a11y }: { a11y: boolean } = { a11y: false }
): string {
  if (durationInMinutes < 60)
    return `${durationInMinutes} ${a11y ? 'minutes' : 'min'}`

  return Duration.fromDurationLike({ minute: durationInMinutes }).toFormat(
    a11y ? DURATION_A11Y_SEPARATOR : DURATION_H_SEPARATOR
  )
}

function toFrenchString(
  date: string | DateTime,
  format?: DateTimeFormatOptions
): string {
  const datetime = date instanceof DateTime ? date : DateTime.fromISO(date)
  return datetime.toLocaleString(format, { locale: 'fr-FR' })
}

function toFrenchFormat(date: string | DateTime, format: string): string {
  const datetime = date instanceof DateTime ? date : DateTime.fromISO(date)
  return datetime.toFormat(format, { locale: 'fr-FR' })
}

export function getPeriodeComprenant(
  date: DateTime,
  { jourSemaineReference }: { jourSemaineReference: JourSemaine }
): Periode {
  const debut = date.set({ weekday: jourSemaineReference }).startOf('day')
  const fin = debut.plus({ day: PERIODE_LENGTH_FULL_DAYS - 1 }).endOf('day')
  return {
    debut,
    fin,
    label: `du ${toLongMonthDate(debut)} au ${toLongMonthDate(fin)}`,
  }
}

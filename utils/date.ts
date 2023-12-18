import { DateTime, Interval } from 'luxon'
import { DateTimeFormatOptions } from 'luxon/src/misc'

export const WEEKDAY_MONTH_LONG: string = 'EEEE d MMMM'
export const MONTH_LONG: string = 'dd MMMM yyyy'
export const TIME_24_H_SEPARATOR: string = "HH'h'mm"
export const TIME_24_A11Y_SEPARATOR: string = "HH 'heure' mm"
export const TIME_24_SIMPLE: string = 'HH:mm'
export const DATE_DASH_SEPARATOR: string = 'yyyy-MM-dd'
export const DATETIME_LONG: string = `dd/MM/yyyy 'à' ${TIME_24_H_SEPARATOR}`

export const AUJOURDHUI_LABEL = 'aujourd’hui'

export function dateIsToday(dateToCheck: DateTime): boolean {
  return DateTime.now().hasSame(dateToCheck, 'day')
}

export function dateIsYesterday(dateToCheck: DateTime): boolean {
  return DateTime.now().minus({ day: 1 }).hasSame(dateToCheck, 'day')
}

export function toFrenchString(
  datetime: DateTime,
  format?: DateTimeFormatOptions
): string {
  return datetime.toLocaleString(format, { locale: 'fr-FR' })
}

export function toShortDate(date: string | DateTime): string {
  const datetime = date instanceof DateTime ? date : DateTime.fromISO(date)
  return toFrenchString(datetime, DateTime.DATE_SHORT)
}

export function toFrenchFormat(date: DateTime, format: string): string {
  return date.toFormat(format, { locale: 'fr-FR' })
}

export function toFullDate(dateStr?: string): string {
  if (!dateStr) return ''

  const dateTime = DateTime.fromISO(dateStr)
  let dateString: string
  if (dateIsToday(dateTime)) {
    dateString = "Aujourd'hui"
  } else if (dateIsYesterday(dateTime)) {
    dateString = 'Hier'
  } else {
    dateString = `Le ${toShortDate(dateTime)}`
  }

  return `${dateString} à ${toFrenchFormat(dateTime, TIME_24_H_SEPARATOR)}`
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
  const diff = Interval.fromDateTimes(date1, date2)
  return Math.round(diff.length('minutes'))
}

export function isMatin(heure: number) {
  return heure <= 12
}

export function isApresMidi(heure: number) {
  return heure > 12
}

export function formatJourIfToday(date: DateTime): string {
  return dateIsToday(date)
    ? AUJOURDHUI_LABEL
    : toFrenchFormat(date, WEEKDAY_MONTH_LONG)
}

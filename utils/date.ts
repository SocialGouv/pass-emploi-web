export const datesAreOnSameDay = (firstDate: Date, secondDate: Date): boolean =>
  firstDate.getFullYear() === secondDate.getFullYear() &&
  firstDate.getMonth() === secondDate.getMonth() &&
  firstDate.getDate() === secondDate.getDate()

export const dateIsToday = (dateToCheck: Date): boolean =>
  datesAreOnSameDay(new Date(), dateToCheck)

export const dateIsYesterday = (dateToCheck: Date): boolean => {
  const yesterday = new Date()

  yesterday.setDate(yesterday.getDate() - 1)

  return datesAreOnSameDay(yesterday, dateToCheck)
}

export const formatDayDate = (date: Date): string => {
  const day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate()
  const month =
    date.getMonth() > 8 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

export const formatHourMinuteDate = (date: Date): string => {
  let hours = date.getHours().toString()
  hours = ('0' + hours).slice(-2)

  let minutes = date.getMinutes().toString()
  minutes = ('0' + minutes).slice(-2)

  return `${hours}:${minutes}`
}

export const formatHourMinuteDateUTC = (date: Date): string => {
  let hours = date.getUTCHours().toString()
  hours = ('0' + hours).slice(-2)

  let minutes = date.getUTCMinutes().toString()
  minutes = ('0' + minutes).slice(-2)

  return `${hours}:${minutes}`
}

export const formatDayAndHourDate = (date: Date): string =>
  `le ${formatDayDate(date)} à ${formatHourMinuteDate(date)}`

export const isDateOlder = (date1: Date, date2: Date): boolean => {
  return date1.getTime() < date2.getTime()
}

export function compareDates(
  date1: Date | undefined,
  date2: Date | undefined
): number {
  if (!date1 && !date2) return 0
  if (!date1) return -1
  else if (!date2) return 1
  return date1.getTime() - date2.getTime()
}

export function compareDatesDesc(
  date1: Date | undefined,
  date2: Date | undefined
): number {
  return -compareDates(date1, date2)
}

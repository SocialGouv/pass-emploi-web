const datesAreOnSameDay = (firstDate: Date, secondDate: Date): boolean =>
  firstDate.getFullYear() === secondDate.getFullYear() &&
  firstDate.getMonth() === secondDate.getMonth() &&
  firstDate.getDate() === secondDate.getDate()

const dateIsToday = (dateToCheck: Date): boolean =>
  datesAreOnSameDay(new Date(), dateToCheck)

const dateIsYesterday = (dateToCheck: Date): boolean => {
  const today = new Date()
  const yesterday = new Date(today)

  yesterday.setDate(yesterday.getDate() - 1)

  return datesAreOnSameDay(yesterday, dateToCheck)
}

const formatDayDate = (date: Date): string => {
  const day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate()
  const month =
    date.getMonth() > 8 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

const formatHourMinuteDate = (date: Date): string => {
  let hours = date.getHours().toString()
  hours = ('0' + hours).slice(-2)

  let minutes = date.getMinutes().toString()
  minutes = ('0' + minutes).slice(-2)

  return `${hours}:${minutes}`
}

const formatHourMinuteDateUTC = (date: Date): string => {
  let hours = date.getUTCHours().toString()
  hours = ('0' + hours).slice(-2)

  let minutes = date.getUTCMinutes().toString()
  minutes = ('0' + minutes).slice(-2)

  return `${hours}:${minutes}`
}

const formatDayAndHourDate = (date: Date): string =>
  `le ${formatDayDate(date)} à ${formatHourMinuteDate(date)}`

const isDateOlder = (date1: Date, date2: Date): boolean => {
  return date1.getTime() < date2.getTime()
}

export {
  datesAreOnSameDay,
  dateIsToday,
  dateIsYesterday,
  formatDayDate,
  formatHourMinuteDate,
  formatHourMinuteDateUTC,
  formatDayAndHourDate,
  isDateOlder,
}

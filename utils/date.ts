const datesAreOnSameDay = (firstDate: Date, secondDate: Date) =>
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()

const dateIsToday = (dateToCheck: Date) => datesAreOnSameDay(new Date(), dateToCheck)

const formatDayDate = (date: Date) =>
{
  const day = (date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())
  const month = (date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

const formatHourMinuteDate = (date: Date) =>
{
  let hours = date.getHours().toString()
  hours = ('0' + hours).slice(-2)

  let minutes = date.getMinutes().toString()
  minutes = ('0' + minutes).slice(-2)

  return `${hours}:${minutes}`
}

const formatHourMinuteDateUTC = (date: Date) =>
{
  let hours = date.getUTCHours().toString()
  hours = ('0' + hours).slice(-2)

  let minutes = date.getUTCMinutes().toString()
  minutes = ('0' + minutes).slice(-2)

  return `${hours}:${minutes}`
}

const formatDayAndHourDate = (date:Date) => `le ${formatDayDate(date)} à ${formatHourMinuteDate(date)}`

const isDateOlder = (date1: Date, date2: Date) => {
  return date1.getTime() < date2.getTime()
}

export {datesAreOnSameDay, dateIsToday, formatDayDate, formatHourMinuteDate, formatHourMinuteDateUTC, formatDayAndHourDate, isDateOlder}
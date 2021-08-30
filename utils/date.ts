const datesAreOnSameDay = (firstDate: Date, secondDate: Date) =>
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate();

const dateIsToday = (dateToCheck: Date) => datesAreOnSameDay(new Date(), dateToCheck)

const formatDayDate = (date: Date) => 
{
  const day = (date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())
  const month = (date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

const formatHourMinuteDate = (date: Date) => `${date.getHours()}:${date.getMinutes()}`

export {datesAreOnSameDay, dateIsToday, formatDayDate, formatHourMinuteDate}
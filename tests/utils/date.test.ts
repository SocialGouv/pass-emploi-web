import {
  datePasseeLoin,
  datePassee,
  dateFuture,
  dateFutureLoin,
  now,
} from 'fixtures/date'
import {
  compareDates,
  compareDatesDesc,
  dateIsToday,
  dateIsYesterday,
  isDateOlder,
} from 'utils/date'

jest.useFakeTimers()

describe('dateUtils', () => {
  describe('isDateOlder', () => {
    it('isDateOlder renvoie true si la date est plus ancienne', () => {
      const dateAvant = new Date('Thu, 21 Oct 2021 10:01:19 GMT')
      const dateApres = new Date('Thu, 21 Oct 2021 10:01:20 GMT')

      const isOlder = isDateOlder(dateAvant, dateApres)

      expect(isOlder).toBeTruthy()
    })
  })

  describe('dateIsToday', () => {
    it("dateIsToday renvoie true si la date correspond à la date d'aujourd'hui", () => {
      //GIVEN
      jest.setSystemTime(new Date('2018-12-31T23:59:59.000Z'))

      //WHEN
      const isToday = dateIsToday(new Date('2018-12-31T23:59:59.000Z'))

      //THEN
      expect(isToday).toBeTruthy()
    })
  })

  describe('dateIsYesterday', () => {
    it("dateIsYesterday renvoie true si la date correspond à la date d'hier", () => {
      //GIVEN
      jest.setSystemTime(new Date('2018-12-31T23:59:59.000Z'))

      //WHEN
      const isYesterday = dateIsYesterday(new Date('2018-12-30T23:59:59.000Z'))

      //THEN
      expect(isYesterday).toBeTruthy()
    })
  })

  describe('compareDates', () => {
    const dates = [now, datePassee, dateFutureLoin, datePasseeLoin, now, dateFuture]

    describe('when comparing asc', () => {
      it('orders date by chronological order', async () => {
        // WHEN
        const actual = [...dates].sort(compareDates)

        // THEN
        expect(actual).toStrictEqual([
          datePasseeLoin,
          datePassee,
          now,
          now,
          dateFuture,
          dateFutureLoin,
        ])
      })
    })

    describe('when comparing desc', () => {
      it('orders date by antechronological order', async () => {
        // WHEN
        const actual = [...dates].sort((d1, d2) => compareDatesDesc(d1, d2))

        // THEN
        expect(actual).toStrictEqual([
          dateFutureLoin,
          dateFuture,
          now,
          now,
          datePassee,
          datePasseeLoin,
        ])
      })
    })
  })
})

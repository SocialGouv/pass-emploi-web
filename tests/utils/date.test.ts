import { DateTime } from 'luxon'

import {
  dateFuture,
  dateFutureLoin,
  datePassee,
  datePasseeLoin,
  now,
} from 'fixtures/date'
import {
  compareDates,
  compareDatesDesc,
  dateIsToday,
  dateIsYesterday,
} from 'utils/date'

describe('dateUtils', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  describe('dateIsToday', () => {
    it("dateIsToday renvoie true si la date correspond à la date d'aujourd'hui", () => {
      //GIVEN
      jest.setSystemTime(
        DateTime.fromISO('2018-12-31T13:59:59.000Z').toJSDate()
      )

      //THEN
      expect(dateIsToday(DateTime.fromISO('2018-12-31T22:59:59.000Z'))).toEqual(
        true
      )
      expect(dateIsToday(DateTime.fromISO('2018-11-31T22:59:59.000Z'))).toEqual(
        false
      )
    })
  })

  describe('dateIsYesterday', () => {
    it("dateIsYesterday renvoie true si la date correspond à la date d'hier", () => {
      //GIVEN
      jest.setSystemTime(
        DateTime.fromISO('2018-12-31T13:59:59.000Z').toJSDate()
      )

      //THEN
      expect(
        dateIsYesterday(DateTime.fromISO('2018-12-30T13:59:59.000Z'))
      ).toEqual(true)
      expect(
        dateIsYesterday(DateTime.fromISO('2018-12-30T23:59:59.000Z'))
      ).toEqual(false)
    })
  })

  describe('compareDates', () => {
    const dates = [
      now,
      datePassee,
      dateFutureLoin,
      datePasseeLoin,
      now,
      dateFuture,
    ]

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

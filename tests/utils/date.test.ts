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
  toRelativeDateTime,
} from 'utils/date'

describe('dateUtils', () => {
  describe('dateIsToday', () => {
    it("dateIsToday renvoie true si la date correspond à la date d'aujourd'hui", () => {
      //GIVEN
      jest
        .spyOn(DateTime, 'now')
        .mockReturnValue(DateTime.fromISO('2018-12-31T13:59:59.000Z'))

      //THEN
      expect(dateIsToday(DateTime.fromISO('2018-12-31T22:59:59.000Z'))).toEqual(
        true
      )
      expect(dateIsToday(DateTime.fromISO('2018-11-30T22:59:59.000Z'))).toEqual(
        false
      )
    })
  })

  describe('dateIsYesterday', () => {
    it("dateIsYesterday renvoie true si la date correspond à la date d'hier", () => {
      //GIVEN
      jest
        .spyOn(DateTime, 'now')
        .mockReturnValue(DateTime.fromISO('2018-12-31T13:59:59.000Z'))

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

  describe('.toFullDate', () => {
    const now = DateTime.fromISO('2018-12-31T13:59:59.000Z')
    beforeEach(async () => {
      //Given
      jest.spyOn(DateTime, 'now').mockReturnValue(now)
    })

    it(`formate la date d'aujourd'hui`, () => {
      //When
      const uneDate = toRelativeDateTime(now.set({ hour: 13, minute: 12 }))

      //Then
      expect(uneDate).toEqual('Aujourd’hui à 13:12')
    })

    it(`formate la date d'hier`, () => {
      //When
      const uneDate = toRelativeDateTime(
        now.minus({ day: 1 }).set({ hour: 13, minute: 12 })
      )

      //Then
      expect(uneDate).toEqual('Hier à 13:12')
    })

    it(`formate autre date`, () => {
      //When
      const uneDate = toRelativeDateTime(
        now.set({ day: 25, hour: 13, minute: 12 })
      )

      //Then
      expect(uneDate).toEqual('Le 25/12/2018 à 13:12')
    })
  })
})

import { dateIsToday, dateIsYesterday, isDateOlder } from 'utils/date'

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
})

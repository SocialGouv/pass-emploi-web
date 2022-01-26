import { onAfterEach, onBeforeEach } from '../jestDateMock'
import { dateIsToday, dateIsYesterday, isDateOlder } from 'utils/date'

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
    beforeEach(onBeforeEach)
    afterEach(onAfterEach)

    it("dateIsToday renvoie true si la date correspond à la date d'aujourd'hui", () => {
      const isToday = dateIsToday(new Date('2018-12-31T23:59:59.000Z'))

      expect(isToday).toBeTruthy()
    })
  })

  describe('dateIsYesterday', () => {
    beforeEach(onBeforeEach)
    afterEach(onAfterEach)

    it("dateIsYesterday renvoie true si la date correspond à la date d'hier", () => {
      const isToday = dateIsYesterday(new Date('2018-12-30T23:59:59.000Z'))

      expect(isToday).toBeTruthy()
    })
  })
})

import { uneAction } from 'fixtures/action'
import {
  datePasseeLoin,
  datePassee,
  dateFuture,
  dateFutureLoin,
  now,
} from 'fixtures/date'
import { compareActionsDatesDesc } from '../../interfaces/action'

describe('Action', () => {
  describe('.compareActionsDatesDesc', () => {
    it('tri les actions par date de création décroissante', () => {
      // Given
      const createdLast = uneAction({
        creationDate: dateFutureLoin.toISOString(),
        lastUpdate: datePasseeLoin.toISOString(),
      })
      const createdAfter = uneAction({
        creationDate: dateFuture.toISOString(),
        lastUpdate: datePassee.toISOString(),
      })
      const createdNow = uneAction({
        creationDate: now.toISOString(),
        lastUpdate: now.toISOString(),
      })
      const createdBefore = uneAction({
        creationDate: datePassee.toISOString(),
        lastUpdate: dateFuture.toISOString(),
      })
      const createdFirst = uneAction({
        creationDate: datePasseeLoin.toISOString(),
        lastUpdate: dateFutureLoin.toISOString(),
      })

      // When
      const actual = [
        createdAfter,
        createdFirst,
        createdBefore,
        createdLast,
        createdNow,
      ].sort(compareActionsDatesDesc)

      // Then
      expect(actual).toStrictEqual([
        createdLast,
        createdAfter,
        createdNow,
        createdBefore,
        createdFirst,
      ])
    })

    it("tri ensuite les actions par date d'update décroissante", () => {
      // Given
      const updatedLast = uneAction({
        lastUpdate: new Date(now.getTime() + 999999).toISOString(),
      })
      const updatedAfter = uneAction({
        lastUpdate: new Date(now.getTime() + 100000).toISOString(),
      })
      const updatedNow = uneAction({ lastUpdate: new Date().toISOString() })
      const updatedBefore = uneAction({
        lastUpdate: new Date(now.getTime() - 100000).toISOString(),
      })
      const updatedFirst = uneAction({
        lastUpdate: new Date(now.getTime() - 999999).toISOString(),
      })

      // When
      const actual = [
        updatedAfter,
        updatedFirst,
        updatedBefore,
        updatedLast,
        updatedNow,
      ].sort(compareActionsDatesDesc)

      // Then
      expect(actual).toStrictEqual([
        updatedLast,
        updatedAfter,
        updatedNow,
        updatedBefore,
        updatedFirst,
      ])
    })
  })
})

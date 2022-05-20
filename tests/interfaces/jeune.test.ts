import { uneAction } from 'fixtures/action'
import {
  dateFuture,
  dateFutureLoin,
  datePassee,
  datePasseeLoin,
  now,
} from 'fixtures/date'
import { unJeune } from 'fixtures/jeune'
import { compareJeunesBySituation } from 'interfaces/jeune'

describe('Jeune', () => {
  describe('.compareJeunesBySituation', () => {
    it('trie les jeunes par situation par ordre alphabétique', () => {
      // Given
      const unJeuneSituationBenevolat = unJeune({
        situationCourante: 'Bénévolat',
      })
      const unJeuneSituationEmploi = unJeune({ situationCourante: 'Emploi' })
      const unJeuneSansSituation = unJeune()
      const unJeuneSansSituationAussi = unJeune()

      // When
      const actual = [
        unJeuneSansSituationAussi,
        unJeuneSituationEmploi,
        unJeuneSansSituation,
        unJeuneSituationBenevolat,
      ].sort(compareJeunesBySituation)

      // Then
      expect(actual).toStrictEqual([
        unJeuneSituationBenevolat,
        unJeuneSituationEmploi,
        unJeuneSansSituationAussi,
        unJeuneSansSituation,
      ])
    })
  })
})

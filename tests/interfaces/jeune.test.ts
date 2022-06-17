import { unItemJeune } from 'fixtures/jeune'
import { CategorieSituation, compareJeunesBySituation } from 'interfaces/jeune'

describe('Jeune', () => {
  describe('.compareJeunesBySituation', () => {
    it('trie les jeunes par situation par ordre alphabétique', () => {
      // Given
      const unJeuneSituationBenevolat = unItemJeune({
        situationCourante: CategorieSituation.CONTRAT_DE_VOLONTARIAT_BENEVOLAT,
      })
      const unJeuneSituationEmploi = unItemJeune({
        situationCourante: CategorieSituation.EMPLOI,
      })
      const unJeuneSansSituation = unItemJeune()
      const unJeuneSansSituationAussi = unItemJeune()

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

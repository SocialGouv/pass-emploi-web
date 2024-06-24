import { DateTime } from 'luxon'

import { unItemJeune, unJeuneChat } from 'fixtures/jeune'
import {
  CategorieSituation,
  compareBeneficiaireChat,
  compareBeneficiairesBySituation,
} from 'interfaces/beneficiaire'

describe('Jeune', () => {
  describe('.compareBeneficiairesBySituation', () => {
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
      ].sort(compareBeneficiairesBySituation)

      // Then
      expect(actual).toStrictEqual([
        unJeuneSituationBenevolat,
        unJeuneSituationEmploi,
        unJeuneSansSituationAussi,
        unJeuneSansSituation,
      ])
    })
  })

  describe('.compareBeneficiaireChat', () => {
    it('trie d’abord par messages non lus, puis suivis, puis anté-chrnonologique', () => {
      // Given
      const unJeuneChatNonLu = unJeuneChat({
        id: 'jeune-1',
        seenByConseiller: false,
        flaggedByConseiller: false,
      })

      const unJeuneChatSuivi = unJeuneChat({
        id: 'jeune-2',
        seenByConseiller: true,
        flaggedByConseiller: true,
      })

      const unJeuneChatRecent = unJeuneChat({
        id: 'jeune-3',
        seenByConseiller: true,
        flaggedByConseiller: false,
        lastMessageSentAt: DateTime.local(2022, 1, 10),
      })

      const unJeuneChatVieux = unJeuneChat({
        id: 'jeune-4',
        seenByConseiller: true,
        flaggedByConseiller: false,
        lastMessageSentAt: DateTime.local(2022, 1, 1),
      })

      // When
      const actual = [
        unJeuneChatVieux,
        unJeuneChatNonLu,
        unJeuneChatRecent,
        unJeuneChatSuivi,
      ].sort(compareBeneficiaireChat)

      // Then
      expect(actual).toStrictEqual([
        unJeuneChatNonLu,
        unJeuneChatSuivi,
        unJeuneChatRecent,
        unJeuneChatVieux,
      ])
    })
  })
})

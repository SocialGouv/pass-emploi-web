import { DateTime } from 'luxon'

import { unItemBeneficiaire, unBeneficiaireChat } from 'fixtures/beneficiaire'
import {
  CategorieSituation,
  compareBeneficiaireChat,
  compareBeneficiairesBySituation,
} from 'interfaces/beneficiaire'

describe('Jeune', () => {
  describe('.compareBeneficiairesBySituation', () => {
    it('trie les jeunes par situation par ordre alphabétique', () => {
      // Given
      const unJeuneSituationBenevolat = unItemBeneficiaire({
        situationCourante: CategorieSituation.CONTRAT_DE_VOLONTARIAT_BENEVOLAT,
      })
      const unJeuneSituationEmploi = unItemBeneficiaire({
        situationCourante: CategorieSituation.EMPLOI,
      })
      const unJeuneSansSituation = unItemBeneficiaire()
      const unJeuneSansSituationAussi = unItemBeneficiaire()

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
      const unJeuneChatNonLu = unBeneficiaireChat({
        id: 'id-beneficiaire-1',
        seenByConseiller: false,
        flaggedByConseiller: false,
      })

      const unJeuneChatSuivi = unBeneficiaireChat({
        id: 'id-beneficiaire-2',
        seenByConseiller: true,
        flaggedByConseiller: true,
      })

      const unJeuneChatRecent = unBeneficiaireChat({
        id: 'id-beneficiaire-3',
        seenByConseiller: true,
        flaggedByConseiller: false,
        lastMessageSentAt: DateTime.local(2022, 1, 10),
      })

      const unJeuneChatVieux = unBeneficiaireChat({
        id: 'id-beneficiaire-4',
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

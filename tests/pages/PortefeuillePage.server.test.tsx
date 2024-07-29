import { render } from '@testing-library/react'
import { DateTime } from 'luxon'

import Portefeuille from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/page'
import PortefeuillePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/PortefeuillePage'
import { desItemsBeneficiaires } from 'fixtures/beneficiaire'
import { compareBeneficiairesByNom } from 'interfaces/beneficiaire'
import { countActionsJeunes } from 'services/actions.service'
import { getJeunesDuConseillerServerSide } from 'services/jeunes.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

jest.mock('utils/auth/auth', () => ({
  getMandatorySessionServerSide: jest.fn(),
}))
jest.mock(
  'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/PortefeuillePage'
)
jest.mock('services/jeunes.service')
jest.mock('services/actions.service')

describe('PortefeuillePage server side', () => {
  beforeEach(() => {
    const jeunes = desItemsBeneficiaires()
    ;(getJeunesDuConseillerServerSide as jest.Mock).mockResolvedValue(jeunes)
    ;(countActionsJeunes as jest.Mock).mockResolvedValue(
      jeunes.map((j) => ({
        idBeneficiaire: j.id,
        actions: 7,
      }))
    )
  })

  it('récupère la liste des jeunes', async () => {
    // Given
    ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
      user: { id: 'id-conseiller', structure: 'POLE_EMPLOI' },
      accessToken: 'accessToken',
    })

    // When
    await Portefeuille({})

    // Then
    expect(getJeunesDuConseillerServerSide).toHaveBeenCalledWith(
      'id-conseiller',
      'accessToken'
    )
  })

  describe('pour un conseiller France Travail', () => {
    beforeEach(async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { id: 'id-conseiller', structure: 'POLE_EMPLOI' },
        accessToken: 'accessToken',
      })

      // When
      render(await Portefeuille({}))
    })

    it('ne récupère pas les actions des jeunes', () => {
      // Then
      expect(countActionsJeunes).not.toHaveBeenCalled()
    })

    it("renvoie les jeunes sans leur nombre d'actions", () => {
      // Then
      expect(PortefeuillePage).toHaveBeenCalledWith(
        expect.objectContaining({
          conseillerJeunes: desItemsBeneficiaires()
            .map((jeune) => ({
              ...jeune,
              nbActionsNonTerminees: 0,
            }))
            .sort(compareBeneficiairesByNom),
        }),
        {}
      )
    })
  })

  describe('pour un conseiller pas France Travail', () => {
    beforeEach(async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { id: 'id-conseiller', structure: 'MILO' },
        accessToken: 'accessToken',
      })

      // When
      render(await Portefeuille({}))
    })

    it('récupère les actions des jeunes', () => {
      jest
        .spyOn(DateTime, 'now')
        .mockReturnValue(DateTime.fromISO('2024-08-01'))
      const dateDebut = DateTime.now().startOf('week')
      const dateFin = DateTime.now().endOf('week')

      // Then
      expect(countActionsJeunes).toHaveBeenCalledWith(
        'id-conseiller',
        dateDebut,
        dateFin,
        'accessToken'
      )
    })

    it("renvoie les jeunes avec leur nombre d'actions", () => {
      // Then
      expect(PortefeuillePage).toHaveBeenCalledWith(
        {
          conseillerJeunes: desItemsBeneficiaires()
            .map((jeune) => ({
              ...jeune,
              nbActionsNonTerminees: 7,
            }))
            .sort(compareBeneficiairesByNom),
          isFromEmail: false,
        },
        {}
      )
    })
  })
})

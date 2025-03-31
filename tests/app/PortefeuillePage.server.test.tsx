import { render } from '@testing-library/react'
import { DateTime } from 'luxon'

import Portefeuille from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/page'
import PortefeuillePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/PortefeuillePage'
import { desItemsBeneficiaires } from 'fixtures/beneficiaire'
import { compareBeneficiairesByNom } from 'interfaces/beneficiaire'
import { recupereCompteursBeneficiairesPortefeuilleMilo } from 'services/actions.service'
import { getBeneficiairesDuConseillerServerSide } from 'services/beneficiaires.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

jest.mock('utils/auth/getMandatorySessionServerSide', () => jest.fn())
jest.mock(
  'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/PortefeuillePage'
)
jest.mock('services/beneficiaires.service')
jest.mock('services/actions.service')

describe('PortefeuillePage server side', () => {
  beforeEach(() => {
    const jeunes = desItemsBeneficiaires()
    ;(getBeneficiairesDuConseillerServerSide as jest.Mock).mockResolvedValue(
      jeunes
    )
    ;(
      recupereCompteursBeneficiairesPortefeuilleMilo as jest.Mock
    ).mockResolvedValue(
      jeunes.map((j) => ({
        idBeneficiaire: j.id,
        actions: 7,
        rdvs: 3,
      }))
    )
  })

  it('récupère la liste des jeunes', async () => {
    // Given
    ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
      user: { id: 'id-conseiller-1', structure: 'POLE_EMPLOI' },
      accessToken: 'accessToken',
    })

    // When
    await Portefeuille({})

    // Then
    expect(getBeneficiairesDuConseillerServerSide).toHaveBeenCalledWith(
      'id-conseiller-1',
      'accessToken'
    )
  })

  describe('pour un conseiller France Travail', () => {
    beforeEach(async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { id: 'id-conseiller-1', structure: 'POLE_EMPLOI' },
        accessToken: 'accessToken',
      })

      // When
      render(await Portefeuille({}))
    })

    it('ne récupère pas les actions des jeunes', () => {
      // Then
      expect(
        recupereCompteursBeneficiairesPortefeuilleMilo
      ).not.toHaveBeenCalled()
    })

    it("renvoie les jeunes sans leur nombre d'actions", () => {
      // Then
      expect(PortefeuillePage).toHaveBeenCalledWith(
        expect.objectContaining({
          conseillerJeunes: desItemsBeneficiaires()
            .map((jeune) => ({
              ...jeune,
              actionsCreees: 0,
              rdvs: 0,
            }))
            .sort(compareBeneficiairesByNom),
        }),
        undefined
      )
    })
  })

  describe('pour un conseiller pas France Travail', () => {
    beforeEach(async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { id: 'id-conseiller-1', structure: 'MILO' },
        accessToken: 'accessToken',
      })

      jest
        .spyOn(DateTime, 'now')
        .mockReturnValue(DateTime.fromISO('2024-08-01'))

      // When
      render(await Portefeuille({}))
    })

    it('récupère les actions des jeunes', () => {
      const dateDebut = DateTime.now().startOf('week')
      const dateFin = DateTime.now().endOf('week')

      // Then
      expect(
        recupereCompteursBeneficiairesPortefeuilleMilo
      ).toHaveBeenCalledWith(
        'id-conseiller-1',
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
              actionsCreees: 7,
              rdvs: 3,
            }))
            .sort(compareBeneficiairesByNom),
          isFromEmail: false,
          page: 1,
        },
        undefined
      )
    })
  })
})

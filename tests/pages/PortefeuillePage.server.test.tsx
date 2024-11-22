import { render } from '@testing-library/react'
import { DateTime } from 'luxon'
import { getServerSession } from 'next-auth'

import Portefeuille from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/page'
import PortefeuillePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/PortefeuillePage'
import { unUtilisateur } from 'fixtures/auth'
import { desItemsBeneficiaires } from 'fixtures/beneficiaire'
import { compareBeneficiairesByNom } from 'interfaces/beneficiaire'
import {
  getBeneficiairesDuConseillerServerSide,
  recupereCompteursBeneficiairesPortefeuilleMilo,
} from 'services/beneficiaires.service'

jest.mock(
  'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/PortefeuillePage'
)
jest.mock('services/beneficiaires.service')

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
    // When
    await Portefeuille({})

    // Then
    expect(getBeneficiairesDuConseillerServerSide).toHaveBeenCalledWith(
      'id-conseiller',
      'accessToken'
    )
  })

  describe('pour un conseiller France Travail', () => {
    beforeEach(async () => {
      // Given
      ;(getServerSession as jest.Mock).mockResolvedValue({
        user: unUtilisateur({ id: 'id-conseiller', structure: 'POLE_EMPLOI' }),
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
        {}
      )
    })
  })

  describe('pour un conseiller pas France Travail', () => {
    beforeEach(async () => {
      // Given
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
      ).toHaveBeenCalledWith('id-conseiller', dateDebut, dateFin, 'accessToken')
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
        },
        {}
      )
    })
  })
})

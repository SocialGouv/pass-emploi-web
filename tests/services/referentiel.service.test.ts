import { FakeApiClient } from '../utils/fakeApiClient'

import { ApiClient } from 'clients/api.client'
import {
  desCommunes,
  desLocalites,
  desMetiers,
  uneListeDAgencesMILO,
  uneListeDAgencesPoleEmploi,
} from 'fixtures/referentiel'
import { StructureConseiller } from 'interfaces/conseiller'
import {
  ReferentielApiService,
  ReferentielService,
} from 'services/referentiel.service'

jest.mock('next-auth/react', () => ({
  getSession: jest.fn(() => ({
    accessToken: 'accessToken',
  })),
}))

describe('ReferentielApiService', () => {
  let apiClient: ApiClient
  let referentielService: ReferentielService
  beforeEach(async () => {
    // Given
    apiClient = new FakeApiClient()
    referentielService = new ReferentielApiService(apiClient)
  })

  describe('.getAgences', () => {
    let structure: StructureConseiller
    beforeEach(() => {
      ;(apiClient.get as jest.Mock).mockImplementation((url: string) => {
        if (url === `/referentiels/agences?structure=MILO`)
          return { content: uneListeDAgencesMILO() }
        if (url === `/referentiels/agences?structure=POLE_EMPLOI`)
          return { content: uneListeDAgencesPoleEmploi() }
      })
    })

    it('renvoie le référentiel des agences MILO', async () => {
      // Given
      structure = StructureConseiller.MILO
      // WHEN
      const actual = await referentielService.getAgences(
        structure,
        'accessToken'
      )

      // THEN
      expect(actual).toStrictEqual(uneListeDAgencesMILO())
    })

    it('renvoie le référentiel des agences Pôle emploi', async () => {
      // Given
      structure = StructureConseiller.POLE_EMPLOI
      // WHEN
      const actual = await referentielService.getAgences(
        structure,
        'accessToken'
      )

      // THEN
      expect(actual).toStrictEqual(uneListeDAgencesPoleEmploi())
    })
  })

  describe('.getCommunesEtDepartements', () => {
    it('retourne un référentiel de communes et départements avec des codes uniques', async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: [...desLocalites(), ...desLocalites()],
      })

      // When
      const actual = await referentielService.getCommunesEtDepartements(
        'Hauts de seine'
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/referentiels/communes-et-departements?recherche=Hauts%20de%20seine',
        'accessToken'
      )
      expect(actual).toEqual(desLocalites())
    })
  })

  describe('.getCommunes', () => {
    it('retourne un référentiel de communes avec des codes uniques', async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: [...desCommunes(), ...desCommunes()],
      })

      // When
      const actual = await referentielService.getCommunes("L'Haÿ-les-Roses")

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        "/referentiels/communes-et-departements?villesOnly=true&recherche=L'Ha%C3%BF-les-Roses",
        'accessToken'
      )
      expect(actual).toEqual(desCommunes())
    })
  })

  describe('.getMetiers', () => {
    it('retourne un référentiel de métiers', async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: desMetiers(),
      })

      // When
      const actual = await referentielService.getMetiers('Développeuse')

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/referentiels/metiers?recherche=D%C3%A9veloppeuse',
        'accessToken'
      )
      expect(actual).toEqual(desMetiers())
    })
  })

  describe('.getActionsPredefinies', () => {
    it('retourne les actions prédéfinies', async () => {
      // Given
      ;(apiClient.get as jest.Mock).mockResolvedValue({
        content: [
          {
            id: 'action-predefinie-1',
            titre: 'Identifier ses atouts et ses compétences',
          },
        ],
      })

      // When
      const actual = await referentielService.getActionsPredefinies(
        'accessToken'
      )

      // Then
      expect(apiClient.get).toHaveBeenCalledWith(
        '/referentiels/actions-predefinies',
        'accessToken'
      )
      expect(actual).toEqual([
        {
          id: 'action-predefinie-1',
          titre: 'Identifier ses atouts et ses compétences',
        },
      ])
    })
  })
})

import { ApiClient } from 'clients/api.client'
import {
  uneListeDAgencesMILO,
  uneListeDAgencesPoleEmploi,
} from 'fixtures/agence'
import { UserStructure } from 'interfaces/conseiller'
import { AgencesApiService } from 'services/agences.service'

jest.mock('clients/api.client')

describe('AgencesApiService', () => {
  let apiClient: ApiClient
  let agencesService: AgencesApiService
  beforeEach(async () => {
    // Given
    apiClient = new ApiClient()
    agencesService = new AgencesApiService(apiClient)
  })

  describe('.getAgences', () => {
    let structure: UserStructure
    beforeEach(() => {
      ;(apiClient.get as jest.Mock).mockImplementation((url: string) => {
        if (url === `/referentiels/agences?structure=MILO`)
          return uneListeDAgencesMILO()
        if (url === `/referentiels/agences?structure=POLE_EMPLOI`)
          return uneListeDAgencesPoleEmploi()
      })
    })

    it('renvoie le referentiel des agences MILO', async () => {
      // Given
      structure = UserStructure.MILO
      // WHEN
      const actual = await agencesService.getAgences(structure, 'accessToken')

      // THEN
      expect(actual).toStrictEqual(uneListeDAgencesMILO())
    })

    it('renvoie le referentiel des agences Pôle Emploi', async () => {
      // Given
      structure = UserStructure.POLE_EMPLOI
      // WHEN
      const actual = await agencesService.getAgences(structure, 'accessToken')

      // THEN
      expect(actual).toStrictEqual(uneListeDAgencesPoleEmploi())
    })
  })
})

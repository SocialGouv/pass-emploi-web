import { apiGet } from 'clients/api.client'
import {
  desCommunes,
  desCommunesJson,
  desLocalites,
  desLocalitesJson,
  desMetiers,
  uneListeDAgencesFranceTravail,
  uneListeDAgencesMILO,
} from 'fixtures/referentiel'
import { Structure, structureFTCej, structureMilo } from 'interfaces/structure'
import {
  getActionsPredefinies,
  getAgencesServerSide,
  getCommunes,
  getCommunesEtDepartements,
  getMetiers,
  getMissionsLocalesClientSide,
} from 'services/referentiel.service'

jest.mock('clients/api.client')

describe('ReferentielApiService', () => {
  describe('.getAgencesServerSide', () => {
    let structure: Structure
    beforeEach(() => {
      ;(apiGet as jest.Mock).mockImplementation((url: string) => {
        if (url === `/referentiels/agences?structure=MILO`)
          return { content: uneListeDAgencesMILO() }
        if (url === `/referentiels/agences?structure=POLE_EMPLOI`)
          return { content: uneListeDAgencesFranceTravail() }
      })
    })

    it('renvoie le référentiel des agences MILO', async () => {
      // Given
      structure = structureMilo
      // WHEN
      const actual = await getAgencesServerSide(structure, 'accessToken')

      // THEN
      expect(actual).toStrictEqual(uneListeDAgencesMILO())
    })

    it('renvoie le référentiel des agences France Travail', async () => {
      // Given
      structure = structureFTCej
      // WHEN
      const actual = await getAgencesServerSide(structure, 'accessToken')

      // THEN
      expect(actual).toStrictEqual(uneListeDAgencesFranceTravail())
    })
  })

  describe('.getMissionsLocalesClientSide', () => {
    it('renvoie le référentiel des agences MILO', async () => {
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: uneListeDAgencesMILO(),
      })

      // WHEN
      const actual = await getMissionsLocalesClientSide()

      // THEN
      expect(apiGet).toHaveBeenCalledWith(
        '/referentiels/agences?structure=MILO',
        'accessToken'
      )
      expect(actual).toStrictEqual(uneListeDAgencesMILO())
    })
  })

  describe('.getCommunesEtDepartements', () => {
    it('retourne un référentiel de communes et départements avec des codes uniques', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: [...desLocalitesJson(), ...desLocalitesJson()],
      })

      // When
      const actual = await getCommunesEtDepartements('Hauts de seine')

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/referentiels/communes-et-departements?recherche=Hauts%20de%20seine',
        'accessToken'
      )
      expect(actual).toEqual(desLocalites())
    })
  })

  describe('.getCommunes', () => {
    it('retourne un référentiel de communes avec des codes uniques', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: [...desCommunesJson(), ...desCommunesJson()],
      })

      // When
      const actual = await getCommunes("L'Haÿ-les-Roses")

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        "/referentiels/communes-et-departements?villesOnly=true&recherche=L'Ha%C3%BF-les-Roses",
        'accessToken'
      )
      expect(actual).toEqual(desCommunes())
    })
  })

  describe('.getMetiers', () => {
    it('retourne un référentiel de métiers', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: desMetiers(),
      })

      // When
      const actual = await getMetiers('Développeuse')

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/referentiels/metiers?recherche=D%C3%A9veloppeuse',
        'accessToken'
      )
      expect(actual).toEqual(desMetiers())
    })
  })

  describe('.getActionsPredefinies', () => {
    it('retourne les actions prédéfinies', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: [
          {
            id: 'action-predefinie-1',
            titre: 'Identifier ses atouts et ses compétences',
          },
        ],
      })

      // When
      const actual = await getActionsPredefinies('accessToken')

      // Then
      expect(apiGet).toHaveBeenCalledWith(
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

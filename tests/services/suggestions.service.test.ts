import { apiPost } from 'clients/api.client'
import {
  partagerRechercheAlternance,
  partagerRechercheImmersion,
  partagerRechercheOffreEmploi,
  partagerRechercheServiceCivique,
} from 'services/suggestions.service'

jest.mock('clients/api.client')

describe('SuggestionsApiService', () => {
  describe('.partagerRechercheOffreEmploi', () => {
    it('envoie les bons paramètres de suggestions d’offre d’emploi', async () => {
      // Given
      const idsJeunes = ['beneficiaire-1', 'beneficiaire-2']
      const titre = 'Prof - Paris'
      const labelLocalite = 'Paris'
      const motsCles = 'Prof'
      const codeDepartement = '75'

      // When
      await partagerRechercheOffreEmploi({
        idsJeunes,
        titre,
        motsCles,
        labelLocalite,
        codeDepartement,
      })

      // Then
      expect(apiPost).toHaveBeenCalledWith(
        '/conseillers/idConseiller/recherches/suggestions/offres-emploi',
        {
          idsJeunes: idsJeunes,
          titre: titre,
          q: motsCles,
          localisation: labelLocalite,
          departement: codeDepartement,
          alternance: false,
        },
        'accessToken'
      )
    })
  })

  describe('.partagerRechercheAlternance', () => {
    it('envoie les bons paramètres de suggestions d’alternance', async () => {
      // Given
      const idsJeunes = ['beneficiaire-1', 'beneficiaire-2']
      const titre = 'Prof - Paris'
      const labelLocalite = 'Paris'
      const motsCles = 'Prof'
      const codeDepartement = '75'

      // When
      await partagerRechercheAlternance({
        idsJeunes,
        titre,
        motsCles,
        labelLocalite,
        codeDepartement,
      })

      // Then
      expect(apiPost).toHaveBeenCalledWith(
        '/conseillers/idConseiller/recherches/suggestions/offres-emploi',
        {
          idsJeunes: idsJeunes,
          titre: titre,
          q: motsCles,
          localisation: labelLocalite,
          departement: codeDepartement,
          alternance: true,
        },
        'accessToken'
      )
    })
  })

  describe('.partagerRechercheImmersion', () => {
    it('envoie les bons paramètres de suggestions d’immersion', async () => {
      // Given
      const idsJeunes = ['beneficiaire-1', 'beneficiaire-2']
      const titre = 'Vendeur - Paris'
      const labelMetier = 'Vendeur'
      const codeMetier = 'E1101'
      const labelLocalite = 'Paris'
      const latitude = 2.323026
      const longitude = 48.830208

      // When
      await partagerRechercheImmersion({
        idsJeunes,
        titre,
        labelMetier,
        codeMetier,
        labelLocalite,
        latitude,
        longitude,
      })

      // Then
      expect(apiPost).toHaveBeenCalledWith(
        '/conseillers/idConseiller/recherches/suggestions/immersions',
        {
          idsJeunes: idsJeunes,
          titre: titre,
          metier: labelMetier,
          rome: codeMetier,
          localisation: labelLocalite,
          lat: latitude,
          lon: longitude,
        },
        'accessToken'
      )
    })
  })

  describe('.partagerRechercheServiceCivique', () => {
    it('envoie les bons paramètres de suggestions de service civique', async () => {
      // Given
      const idsJeunes = ['beneficiaire-1', 'beneficiaire-2']
      const titre = 'Paris'
      const labelLocalite = 'Paris'
      const latitude = 2.323026
      const longitude = 48.830208

      // When
      await partagerRechercheServiceCivique({
        idsJeunes,
        titre,
        labelLocalite,
        latitude,
        longitude,
      })

      // Then
      expect(apiPost).toHaveBeenCalledWith(
        '/conseillers/idConseiller/recherches/suggestions/services-civique',
        {
          idsJeunes: idsJeunes,
          titre: titre,
          localisation: labelLocalite,
          lat: latitude,
          lon: longitude,
        },
        'accessToken'
      )
    })
  })
})

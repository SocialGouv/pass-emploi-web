import { apiDelete, apiGet, apiPost, apiPut } from 'clients/api.client'
import { desListes, uneListe } from 'fixtures/listes'
import { Liste } from 'interfaces/liste'
import {
  creerListe,
  getListesClientSide,
  getListesServerSide,
  modifierListe,
  recupererListe,
  supprimerListe,
} from 'services/listes.service'

jest.mock('clients/api.client')

describe('ListesApiService', () => {
  describe('.getListesClientSide', () => {
    it('renvoie les listes du conseiller', async () => {
      // Given
      const listes: Liste[] = desListes()
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: listes,
      })

      // When
      const actual = await getListesClientSide()

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers/id-conseiller-1/listes-de-diffusion',
        'accessToken'
      )
      expect(actual).toEqual(listes)
    })
  })

  describe('.getListesServerSide', () => {
    it('renvoie les listes du conseiller', async () => {
      // Given
      const listes: Liste[] = desListes()
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: listes,
      })

      // When
      const actual = await getListesServerSide('id-conseiller-1', 'accessToken')

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers/id-conseiller-1/listes-de-diffusion',
        'accessToken'
      )
      expect(actual).toEqual(listes)
    })
  })

  describe('.recupererListe', () => {
    it('renvoie la liste', async () => {
      // Given
      const liste: Liste = uneListe()

      ;(apiGet as jest.Mock).mockResolvedValue({
        content: liste,
      })

      // When
      const actual = await recupererListe('id-liste-1', 'accessToken')

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/listes-de-diffusion/id-liste-1',
        'accessToken'
      )
      expect(actual).toEqual(liste)
    })
  })

  describe('.creerListe', () => {
    it('crée la liste', async () => {
      // Given
      const titre = 'Un titre'
      const idsBeneficiaires = ['id-beneficiaire-1', 'id-beneficiaire-2']

      // When
      await creerListe({
        titre,
        idsBeneficiaires: idsBeneficiaires,
      })

      // Then
      expect(apiPost).toHaveBeenCalledWith(
        '/conseillers/id-conseiller-1/listes-de-diffusion',
        { titre, idsBeneficiaires },
        'accessToken'
      )
    })
  })

  describe('.modifierListe', () => {
    it('modifie la liste', async () => {
      // Given
      const titre = 'Un titre'
      const idsBeneficiaires = ['id-beneficiaire-1', 'id-beneficiaire-2']

      // When
      await modifierListe('id-liste', {
        titre,
        idsBeneficiaires: idsBeneficiaires,
      })

      // Then
      expect(apiPut).toHaveBeenCalledWith(
        '/listes-de-diffusion/id-liste',
        { titre, idsBeneficiaires },
        'accessToken'
      )
    })
  })

  describe('.supprimerListe', () => {
    it('modifie la liste', async () => {
      // When
      await supprimerListe('id-liste')

      // Then
      expect(apiDelete).toHaveBeenCalledWith(
        '/listes-de-diffusion/id-liste',
        'accessToken'
      )
    })
  })
})

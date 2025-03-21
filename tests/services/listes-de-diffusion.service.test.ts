import { apiDelete, apiGet, apiPost, apiPut } from 'clients/api.client'
import {
  desListesDeDiffusion,
  uneListeDeDiffusion,
} from 'fixtures/listes-de-diffusion'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import {
  creerListeDeDiffusion,
  getListesDeDiffusionClientSide,
  getListesDeDiffusionServerSide,
  modifierListeDeDiffusion,
  recupererListeDeDiffusion,
  supprimerListeDeDiffusion,
} from 'services/listes-de-diffusion.service'

jest.mock('clients/api.client')

describe('ListesDeDiffusionApiService', () => {
  describe('.getListesDeDiffusionClientSide', () => {
    it('renvoie les listes de diffusion du conseiller', async () => {
      // Given
      const listesDeDiffusion: ListeDeDiffusion[] = desListesDeDiffusion()
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: listesDeDiffusion,
      })

      // When
      const actual = await getListesDeDiffusionClientSide()

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers/id-conseiller-1/listes-de-diffusion',
        'accessToken'
      )
      expect(actual).toEqual(listesDeDiffusion)
    })
  })

  describe('.getListesDeDiffusionServerSide', () => {
    it('renvoie les listes de diffusion du conseiller', async () => {
      // Given
      const listesDeDiffusion: ListeDeDiffusion[] = desListesDeDiffusion()
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: listesDeDiffusion,
      })

      // When
      const actual = await getListesDeDiffusionServerSide(
        'id-conseiller-1',
        'accessToken'
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers/id-conseiller-1/listes-de-diffusion',
        'accessToken'
      )
      expect(actual).toEqual(listesDeDiffusion)
    })
  })

  describe('.recupererListeDeDiffusion', () => {
    it('renvoie la liste de diffusion', async () => {
      // Given
      const listeDeDiffusion: ListeDeDiffusion = uneListeDeDiffusion()

      ;(apiGet as jest.Mock).mockResolvedValue({
        content: listeDeDiffusion,
      })

      // When
      const actual = await recupererListeDeDiffusion(
        'id-liste-1',
        'accessToken'
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/listes-de-diffusion/id-liste-1',
        'accessToken'
      )
      expect(actual).toEqual(listeDeDiffusion)
    })
  })

  describe('.creerListeDeDiffusion', () => {
    it('crée la liste de diffusion', async () => {
      // Given
      const titre = 'Un titre'
      const idsBeneficiaires = ['id-beneficiaire-1', 'id-beneficiaire-2']

      // When
      await creerListeDeDiffusion({
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

  describe('.modifierListeDeDiffusion', () => {
    it('modifie la liste de diffusion', async () => {
      // Given
      const titre = 'Un titre'
      const idsBeneficiaires = ['id-beneficiaire-1', 'id-beneficiaire-2']

      // When
      await modifierListeDeDiffusion('id-liste', {
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

  describe('.supprimerListeDeDiffusion', () => {
    it('modifie la liste de diffusion', async () => {
      // When
      await supprimerListeDeDiffusion('id-liste')

      // Then
      expect(apiDelete).toHaveBeenCalledWith(
        '/listes-de-diffusion/id-liste',
        'accessToken'
      )
    })
  })
})

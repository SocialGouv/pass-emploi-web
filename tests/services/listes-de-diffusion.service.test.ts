import { apiDelete, apiGet, apiPost, apiPut } from 'clients/api.client'
import {
  desListesDeDiffusion,
  uneListeDeDiffusion,
} from 'fixtures/listes-de-diffusion'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import {
  creerListeDeDiffusion,
  modifierListeDeDiffusion,
  supprimerListeDeDiffusion,
} from 'server-actions/listes-de-diffusion.server-actions'
import {
  getListesDeDiffusionClientSide,
  getListesDeDiffusionServerSide,
  recupererListeDeDiffusion,
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
        '/conseillers/id-conseiller/listes-de-diffusion',
        'accessToken',
        'listes-diffusion'
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
        'idConseiller',
        'accessToken'
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers/idConseiller/listes-de-diffusion',
        'accessToken',
        'listes-diffusion'
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
      const actual = await recupererListeDeDiffusion('1', 'accessToken')

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/listes-de-diffusion/1',
        'accessToken',
        'liste-diffusion'
      )
      expect(actual).toEqual(listeDeDiffusion)
    })
  })

  describe('.creerListeDeDiffusion', () => {
    it('crée la liste de diffusion', async () => {
      // Given
      const titre = 'Un titre'
      const idsBeneficiaires = ['id-1', 'id-2']

      // When
      await creerListeDeDiffusion({
        titre,
        idsBeneficiaires: idsBeneficiaires,
      })

      // Then
      expect(apiPost).toHaveBeenCalledWith(
        '/conseillers/id-conseiller/listes-de-diffusion',
        { titre, idsBeneficiaires },
        'accessToken',
        ['liste-diffusion', 'listes-diffusion']
      )
    })
  })

  describe('.modifierListeDeDiffusion', () => {
    it('modifie la liste de diffusion', async () => {
      // Given
      const titre = 'Un titre'
      const idsBeneficiaires = ['id-1', 'id-2']

      // When
      await modifierListeDeDiffusion('id-liste', {
        titre,
        idsBeneficiaires: idsBeneficiaires,
      })

      // Then
      expect(apiPut).toHaveBeenCalledWith(
        '/listes-de-diffusion/id-liste',
        { titre, idsBeneficiaires },
        'accessToken',
        ['liste-diffusion', 'listes-diffusion']
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
        'accessToken',
        ['liste-diffusion']
      )
    })
  })
})

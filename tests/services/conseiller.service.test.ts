import { apiDelete, apiGet, apiPost, apiPut } from 'clients/api.client'
import { unConseiller, unConseillerJson } from 'fixtures/conseiller'
import { StructureConseiller } from 'interfaces/conseiller'
import {
  getConseillerByEmail,
  getConseillerClientSide,
  getConseillerServerSide,
  getConseillersEtablissementServerSide,
  modifierAgence,
  modifierNotificationsSonores,
  recupererBeneficiaires,
  supprimerConseiller,
} from 'services/conseiller.service'

jest.mock('clients/api.client')

describe('ConseillerApiService', () => {
  describe('.getConseillerClientSide', () => {
    it('renvoie les informations d’un conseiller', async () => {
      // Given
      const idConseiller = 'idConseiller'
      const accessToken = 'accessToken'
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: unConseillerJson({
          agence: {
            nom: 'Milo Marseille',
            id: 'id-agence',
          },
        }),
      })

      // When
      const actual = await getConseillerClientSide()

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        `/conseillers/${idConseiller}`,
        accessToken
      )
      expect(actual).toEqual(
        unConseiller({ agence: { nom: 'Milo Marseille', id: 'id-agence' } })
      )
    })
  })

  describe('.getConseillerServerSide', () => {
    it('renvoie les informations d’un conseiller', async () => {
      // Given
      const accessToken = 'accessToken'
      const user = {
        id: 'id-user',
        name: 'Albert Durant',
        structure: StructureConseiller.PASS_EMPLOI,
        email: 'albert.durant@gmail.com',
        estConseiller: true,
        estSuperviseur: false,
      }
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: unConseillerJson({
          agence: {
            nom: 'Milo Marseille',
            id: 'id-agence',
          },
        }),
      })

      // When
      const actual = await getConseillerServerSide(user, accessToken)

      // Then
      expect(apiGet).toHaveBeenCalledWith('/conseillers/id-user', accessToken)
      expect(actual).toEqual(
        unConseiller({ agence: { nom: 'Milo Marseille', id: 'id-agence' } })
      )
    })
  })

  describe('.getConseillersEtablissementServerSide', () => {
    it('renvoie une liste de conseillers de l’établissement', async () => {
      // Given
      const idAgence = 'id-agence'
      const accessToken = 'accessToken'
      const user = {
        id: 'id-user',
        name: 'Albert Durant',
        structure: StructureConseiller.MILO,
        email: 'albert.durant@gmail.com',
        estConseiller: true,
        estSuperviseur: true,
      }
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: [
          unConseillerJson({
            id: '1',
            agence: {
              nom: 'Milo Marseille',
              id: 'id-agence',
            },
          }),
          unConseillerJson({
            id: '2',
            agence: {
              nom: 'Milo Marseille',
              id: 'id-agence',
            },
          }),
        ],
      })

      // When
      const actual = await getConseillersEtablissementServerSide(
        accessToken,
        idAgence,
        user
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        `/etablissements/${idAgence}/conseillers`,
        accessToken
      )
      expect(actual).toEqual([
        unConseiller({
          id: '1',
          agence: { nom: 'Milo Marseille', id: 'id-agence' },
          structure: StructureConseiller.MILO,
          estSuperviseur: true,
        }),
        unConseiller({
          id: '2',
          agence: { nom: 'Milo Marseille', id: 'id-agence' },
          structure: StructureConseiller.MILO,
          estSuperviseur: true,
        }),
      ])
    })
  })

  describe('.getConseillerByEmail', () => {
    it('renvoie les informations d’un conseiller', async () => {
      // Given
      const idConseiller = 'idConseiller'
      const accessToken = 'accessToken'
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: unConseillerJson(),
      })

      // When
      const actual = await getConseillerByEmail('conseiller@email.com')

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers?email=conseiller@email.com',
        accessToken
      )
      expect(actual).toEqual({
        id: '1',
        firstName: 'Nils',
        lastName: 'Tavernier',
      })
    })
  })

  describe('.modifierAgence', () => {
    it("modifie le conseiller avec l'id de l'agence", async () => {
      // When
      await modifierAgence({ id: 'id-agence', nom: 'Agence' })

      // Then
      expect(apiPut).toHaveBeenCalledWith(
        '/conseillers/idConseiller',
        { agence: { id: 'id-agence' } },
        'accessToken'
      )
    })

    it("modifie le conseiller avec le nom de l'agence", async () => {
      // When
      await modifierAgence({ nom: 'Agence libre' })

      // Then
      expect(apiPut).toHaveBeenCalledWith(
        '/conseillers/idConseiller',
        { agence: { nom: 'Agence libre' } },
        'accessToken'
      )
    })
  })

  describe('.modifierNotificationsSonores', () => {
    it("modifie le conseiller avec l'activation des notifications sonores", async () => {
      // When
      await modifierNotificationsSonores('id-conseiller', true)

      // Then
      expect(apiPut).toHaveBeenCalledWith(
        '/conseillers/id-conseiller',
        { notificationsSonores: true },
        'accessToken'
      )
    })
  })

  describe('.recupererBeneficiaires', () => {
    it('récupère les bénéficiaires transférés temporairement', async () => {
      // When
      await recupererBeneficiaires()

      // Then
      expect(apiPost).toHaveBeenCalledWith(
        '/conseillers/idConseiller/recuperer-mes-jeunes',
        {},
        'accessToken'
      )
    })
  })

  describe('.supprimerConseiller', () => {
    it('supprime le conseiller', async () => {
      // Given
      const accessToken = 'accessToken'

      // When
      await supprimerConseiller('id-conseiller')

      // Then
      expect(apiDelete).toHaveBeenCalledWith(
        '/conseillers/id-conseiller',
        accessToken
      )
    })
  })
})

import { DateTime } from 'luxon'

import { apiDelete, apiGet, apiPost, apiPut } from 'clients/api.client'
import {
  unBaseConseillerJson,
  unConseiller,
  unConseillerJson,
} from 'fixtures/conseiller'
import { StructureConseiller } from 'interfaces/conseiller'
import {
  getConseillers,
  getConseillerServerSide,
  modifierAgence,
  modifierDateSignatureCGU,
  modifierNotificationsSonores,
  recupererBeneficiaires,
  supprimerConseiller,
} from 'services/conseiller.service'

jest.mock('clients/api.client')

describe('ConseillerApiService', () => {
  describe('.getConseillerServerSide', () => {
    it('renvoie les informations d’un conseiller', async () => {
      // Given
      const accessToken = 'accessToken'
      const dateSignature = '2023-10-03T00:00:00.000+02:00'

      const user = {
        id: 'id-user',
        name: 'Albert Durant',
        structure: StructureConseiller.MILO,
        email: 'albert.durant@gmail.com',
        estConseiller: true,
        estSuperviseur: false,
        estSuperviseurPEBRSA: false,
        dateSignatureCGU: dateSignature,
      }
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: unConseillerJson({
          agence: {
            nom: 'Milo Marseille',
            id: 'id-agence',
          },
          dateSignatureCGU: dateSignature,
        }),
      })

      // When
      const actual = await getConseillerServerSide(user, accessToken)

      // Then
      expect(apiGet).toHaveBeenCalledWith('/conseillers/id-user', accessToken)
      expect(actual).toEqual(
        unConseiller({
          agence: { nom: 'Milo Marseille', id: 'id-agence' },
          dateSignatureCGU: dateSignature,
        })
      )
    })
  })

  describe('.getConseillers', () => {
    it('renvoie les informations des conseillers', async () => {
      // Given
      const accessToken = 'accessToken'
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: [unBaseConseillerJson()],
      })

      // When
      const actual = await getConseillers('conseiller@email.com')

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers?q=conseiller@email.com',
        accessToken
      )
      expect(actual).toEqual([
        {
          id: '1',
          firstName: 'Nils',
          lastName: 'Tavernier',
          email: 'nils.tavernier@mail.com',
        },
      ])
    })
    it('renvoie les informations des conseillers de la structure demandée', async () => {
      // Given
      const accessToken = 'accessToken'
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: [unBaseConseillerJson()],
      })

      // When
      const actual = await getConseillers(
        'conseiller@email.com',
        StructureConseiller.POLE_EMPLOI_BRSA
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers?q=conseiller@email.com&structure=POLE_EMPLOI_BRSA',
        accessToken
      )
      expect(actual).toEqual([
        {
          id: '1',
          firstName: 'Nils',
          lastName: 'Tavernier',
          email: 'nils.tavernier@mail.com',
        },
      ])
    })
  })

  describe('.modifierDateSignatureCGU', () => {
    it('modifie le conseiller avec la nouvelle date de signature des CGU', async () => {
      const nouvelleDate = DateTime.now()

      // When
      await modifierDateSignatureCGU(nouvelleDate)

      // Then
      expect(apiPut).toHaveBeenCalledWith(
        '/conseillers/idConseiller',
        { dateSignatureCGU: nouvelleDate },
        'accessToken'
      )
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

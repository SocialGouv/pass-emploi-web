import { DateTime } from 'luxon'
import { Session } from 'next-auth'

import { apiDelete, apiGet, apiPut } from 'clients/api.client'
import {
  desConseillersBeneficiaire,
  desConseillersBeneficiaireJson,
} from 'fixtures/beneficiaire'
import {
  unBaseConseillerJson,
  unConseiller,
  unConseillerJson,
} from 'fixtures/conseiller'
import { StructureConseiller } from 'interfaces/conseiller'
import {
  getConseillers,
  getConseillersDuJeuneClientSide,
  getConseillersDuJeuneServerSide,
  getConseillerServerSide,
  modifierAgence,
  modifierDateSignatureCGU,
  modifierNotificationsSonores,
  supprimerConseiller,
} from 'services/conseillers.service'

jest.mock('clients/api.client')

describe('ConseillerApiService', () => {
  describe('.getConseillerServerSide', () => {
    it('renvoie les informations d’un conseiller', async () => {
      // Given
      const accessToken = 'accessToken'
      const uneDate = '2023-10-03T00:00:00.000+02:00'

      const user: Session.HydratedUser = {
        id: 'id-user',
        name: 'Albert Durant',
        structure: StructureConseiller.MILO,
        email: 'albert.durant@gmail.com',
        estConseiller: true,
        estSuperviseur: false,
        estSuperviseurResponsable: false,
      }
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: unConseillerJson({
          agence: {
            nom: 'Milo Marseille',
            id: 'id-agence',
          },
          dateSignatureCGU: uneDate,
          dateVisionnageActus: uneDate,
        }),
      })

      // When
      const actual = await getConseillerServerSide(user, accessToken)

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/conseillers/id-user',
        accessToken,
        'conseiller'
      )
      expect(actual).toEqual(
        unConseiller({
          agence: { nom: 'Milo Marseille', id: 'id-agence' },
          dateSignatureCGU: uneDate,
          dateVisionnageActus: uneDate,
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
        accessToken,
        'conseillers'
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
        accessToken,
        'conseillers'
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

  describe('.getConseillersDuJeuneClientSide', () => {
    it('renvoie les conseillers du jeune', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: desConseillersBeneficiaireJson(),
      })

      // When
      const actual = await getConseillersDuJeuneClientSide('id-jeune')

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/jeunes/id-jeune/conseillers',
        'accessToken',
        'conseillers'
      )
      expect(actual).toEqual(desConseillersBeneficiaire())
    })
  })

  describe('.getConseillersDuJeuneServerSide', () => {
    it('renvoie les conseillers du jeune', async () => {
      // Given
      ;(apiGet as jest.Mock).mockResolvedValue({
        content: desConseillersBeneficiaireJson(),
      })

      // When
      const actual = await getConseillersDuJeuneServerSide(
        'id-jeune',
        'accessToken'
      )

      // Then
      expect(apiGet).toHaveBeenCalledWith(
        '/jeunes/id-jeune/conseillers',
        'accessToken',
        'conseillers'
      )
      expect(actual).toEqual(desConseillersBeneficiaire())
    })
  })

  describe('.modifierDateSignatureCGU', () => {
    it('modifie le conseiller avec la nouvelle date de signature des CGU', async () => {
      const nouvelleDate = DateTime.now()

      // When
      await modifierDateSignatureCGU(nouvelleDate)

      // Then
      expect(apiPut).toHaveBeenCalledWith(
        '/conseillers/id-conseiller',
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
        '/conseillers/id-conseiller',
        { agence: { id: 'id-agence' } },
        'accessToken'
      )
    })

    it("modifie le conseiller avec le nom de l'agence", async () => {
      // When
      await modifierAgence({ nom: 'Agence libre' })

      // Then
      expect(apiPut).toHaveBeenCalledWith(
        '/conseillers/id-conseiller',
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

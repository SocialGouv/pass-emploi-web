import { render } from '@testing-library/react'
import { DateTime } from 'luxon'

import FicheBeneficiairePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiairePage'
import FicheBeneficiaire from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/page'
import { uneAction } from 'fixtures/action'
import {
  desConseillersBeneficiaire,
  unDetailBeneficiaire,
  uneMetadonneeFavoris,
} from 'fixtures/beneficiaire'
import { unConseiller } from 'fixtures/conseiller'
import { dateFuture, dateFutureLoin, datePasseeLoin, now } from 'fixtures/date'
import { unEvenementListItem } from 'fixtures/evenement'
import { uneListeDOffres } from 'fixtures/favoris'
import { StructureConseiller } from 'interfaces/conseiller'
import { getActionsBeneficiaireServerSide } from 'services/actions.service'
import {
  getConseillersDuJeuneServerSide,
  getJeuneDetails,
  getMetadonneesFavorisJeune,
} from 'services/beneficiaires.service'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getRendezVousJeune } from 'services/evenements.service'
import { getOffres } from 'services/favoris.service'
import { getSessionsMiloBeneficiaire } from 'services/sessions.service'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

jest.mock('utils/auth/auth', () => ({
  getMandatorySessionServerSide: jest.fn(),
}))
jest.mock(
  'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiairePage'
)
jest.mock('services/beneficiaires.service')
jest.mock('services/sessions.service')
jest.mock('services/evenements.service')
jest.mock('services/actions.service')
jest.mock('services/favoris.service')
jest.mock('services/conseiller.service')

describe('FicheBeneficiairePage server side', () => {
  const rdvAVenir = unEvenementListItem({
    date: DateTime.now().plus({ day: 1 }).toISO(),
  })
  const sessionsAVenir = [
    {
      id: '1',
      type: 'Atelier i-milo',
      date: '2022-09-01T11:00:00.000Z',
      duree: 120,
      createur: {
        id: '1',
      },
      isSession: true,
    },
  ]

  beforeEach(() => {
    ;(getJeuneDetails as jest.Mock).mockResolvedValue(
      unDetailBeneficiaire({ structureMilo: { id: 'id-test' } })
    )
    ;(getConseillersDuJeuneServerSide as jest.Mock).mockResolvedValue(
      desConseillersBeneficiaire()
    )
    ;(getMetadonneesFavorisJeune as jest.Mock).mockResolvedValue(
      uneMetadonneeFavoris()
    )
    ;(getRendezVousJeune as jest.Mock).mockResolvedValue([rdvAVenir])
    ;(getSessionsMiloBeneficiaire as jest.Mock).mockResolvedValue([
      sessionsAVenir,
    ])
    ;(getActionsBeneficiaireServerSide as jest.Mock).mockResolvedValue({
      actions: [
        uneAction({ creationDate: now.toISO() }),
        uneAction({ creationDate: datePasseeLoin.toISO() }),
        uneAction({ creationDate: dateFuture.toISO() }),
        uneAction({ creationDate: dateFutureLoin.toISO() }),
      ],
      metadonnees: { nombreTotal: 14, nombrePages: 2 },
    })
    ;(getOffres as jest.Mock).mockResolvedValue(uneListeDOffres())
    ;(getConseillerServerSide as jest.Mock).mockReturnValue(
      unConseiller({
        id: 'id-conseiller',
        structure: StructureConseiller.MILO,
        structureMilo: { nom: 'Agence', id: 'id-test' },
      })
    )
  })

  describe('Quand la session est valide', () => {
    beforeEach(async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockReturnValue({
        accessToken: 'accessToken',
        user: { id: 'id-conseiller', structure: 'MILO' },
      })

      // When
      render(await FicheBeneficiaire({ params: { idJeune: 'id-jeune' } }))
    })

    it('récupère les infos du jeune', async () => {
      // Then
      expect(getJeuneDetails).toHaveBeenCalledWith('id-jeune', 'accessToken')
      expect(FicheBeneficiairePage).toHaveBeenCalledWith(
        {
          beneficiaire: unDetailBeneficiaire({
            structureMilo: { id: 'id-test' },
          }),
          rdvs: expect.arrayContaining([]),
          actionsInitiales: expect.objectContaining({}),
          metadonneesFavoris: expect.objectContaining({}),
          offresFT: expect.arrayContaining([]),
          recherchesFT: expect.arrayContaining([]),
          onglet: 'ACTIONS',
          lectureSeule: false,
          erreurSessions: false,
        },
        {}
      )
    })

    it('récupère les rendez-vous à venir du jeune', async () => {
      // Then
      expect(getRendezVousJeune).toHaveBeenCalledWith(
        'id-jeune',
        'FUTURS',
        'accessToken'
      )
      expect(getSessionsMiloBeneficiaire).toHaveBeenCalledWith(
        'id-jeune',
        'accessToken',
        now.startOf('day')
      )
      expect(FicheBeneficiairePage).toHaveBeenCalledWith(
        expect.objectContaining({ rdvs: [rdvAVenir, sessionsAVenir] }),
        {}
      )
    })

    it('récupère les favoris', async () => {
      // Then
      expect(getMetadonneesFavorisJeune).toHaveBeenCalledWith(
        'id-jeune',
        'accessToken'
      )
      expect(FicheBeneficiairePage).toHaveBeenCalledWith(
        expect.objectContaining({ metadonneesFavoris: uneMetadonneeFavoris() }),
        {}
      )
    })

    it('récupère la première page des actions du jeune', async () => {
      // Then
      expect(getActionsBeneficiaireServerSide).toHaveBeenCalledWith(
        'id-jeune',
        1,
        'accessToken'
      )
      expect(FicheBeneficiairePage).toHaveBeenCalledWith(
        expect.objectContaining({
          actionsInitiales: {
            actions: [
              uneAction({ creationDate: now.toISO() }),
              uneAction({ creationDate: datePasseeLoin.toISO() }),
              uneAction({ creationDate: dateFuture.toISO() }),
              uneAction({ creationDate: dateFutureLoin.toISO() }),
            ],
            page: 1,
            metadonnees: { nombreTotal: 14, nombrePages: 2 },
          },
        }),
        {}
      )
    })
  })

  describe('Quand on demande une page d’actions spécifique', () => {
    it('récupère la page demandée des actions du jeune', async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockReturnValue({
        accessToken: 'accessToken',
        user: { id: 'id-conseiller', structure: 'MILO' },
      })

      // When
      render(
        await FicheBeneficiaire({
          params: { idJeune: 'id-jeune' },
          searchParams: { page: '3' },
        })
      )

      // Then
      expect(getActionsBeneficiaireServerSide).toHaveBeenCalledWith(
        'id-jeune',
        3,
        'accessToken'
      )
      expect(FicheBeneficiairePage).toHaveBeenCalledWith(
        expect.objectContaining({
          actionsInitiales: expect.objectContaining({
            page: 3,
          }),
        }),
        {}
      )
    })
  })

  describe('Quand on vient du détail d’une action', () => {
    it('récupère l’onglet sur lequel ouvrir la page', async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockReturnValue({
        accessToken: 'accessToken',
        user: { structure: 'MILO' },
      })

      // When
      render(
        await FicheBeneficiaire({
          params: { idJeune: 'id-jeune' },
          searchParams: { onglet: 'actions' },
        })
      )

      // Then
      expect(FicheBeneficiairePage).toHaveBeenCalledWith(
        expect.objectContaining({ onglet: 'ACTIONS' }),
        {}
      )
    })
  })

  describe('Quand le conseiller est France Travail', () => {
    beforeEach(async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockReturnValue({
        user: { structure: 'POLE_EMPLOI' },
      })
      ;(getConseillerServerSide as jest.Mock).mockReturnValue(
        unConseiller({
          id: 'id-conseiller',
        })
      )

      // When
      render(await FicheBeneficiaire({ params: { idJeune: 'id-jeune' } }))
    })

    it('ne recupère pas les rendez-vous', async () => {
      // Then
      expect(getRendezVousJeune).not.toHaveBeenCalled()
      expect(getSessionsMiloBeneficiaire).not.toHaveBeenCalled()
      expect(FicheBeneficiairePage).toHaveBeenCalledWith(
        expect.objectContaining({ rdvs: [] }),
        {}
      )
    })

    it('ne recupère pas les actions', async () => {
      // Then
      expect(getActionsBeneficiaireServerSide).not.toHaveBeenCalled()
      expect(FicheBeneficiairePage).toHaveBeenCalledWith(
        expect.objectContaining({
          actionsInitiales: expect.objectContaining({ actions: [] }),
        }),
        {}
      )
    })
  })

  describe('Quand le conseiller est observateur', () => {
    it('prépare la page en lecture seule', async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockReturnValue({
        accessToken: 'accessToken',
        user: { id: 'id-observateur', structure: 'MILO' },
      })

      // When
      render(await FicheBeneficiaire({ params: { idJeune: 'id-jeune' } }))

      // Then
      expect(getJeuneDetails).toHaveBeenCalledWith('id-jeune', 'accessToken')

      expect(FicheBeneficiairePage).toHaveBeenCalledWith(
        expect.objectContaining({ lectureSeule: true }),
        {}
      )
    })
  })
})

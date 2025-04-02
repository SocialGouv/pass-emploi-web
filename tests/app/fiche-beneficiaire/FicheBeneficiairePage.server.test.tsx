import { render } from '@testing-library/react'
import { DateTime } from 'luxon'

import FicheBeneficiairePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiairePage'
import FicheBeneficiaire from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/page'
import {
  desConseillersBeneficiaire,
  unDetailBeneficiaire,
  uneListeDeDemarches,
  uneMetadonneeFavoris,
} from 'fixtures/beneficiaire'
import { unConseiller } from 'fixtures/conseiller'
import { now } from 'fixtures/date'
import { unEvenementListItem } from 'fixtures/evenement'
import { uneListeDeRecherches, uneListeDOffres } from 'fixtures/favoris'
import { structureFTCej, structureMilo } from 'interfaces/structure'
import {
  getConseillersDuJeuneServerSide,
  getDemarchesBeneficiaire,
  getJeuneDetails,
  getMetadonneesFavorisJeune,
} from 'services/beneficiaires.service'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getRendezVousJeune } from 'services/evenements.service'
import { getOffres, getRecherchesSauvegardees } from 'services/favoris.service'
import { getSessionsMiloBeneficiaire } from 'services/sessions.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

jest.mock('utils/auth/getMandatorySessionServerSide', () => jest.fn())
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
        id: 'id-conseiller-1',
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
    ;(getOffres as jest.Mock).mockResolvedValue(uneListeDOffres())
    ;(getRecherchesSauvegardees as jest.Mock).mockResolvedValue(
      uneListeDeRecherches()
    )
    ;(getDemarchesBeneficiaire as jest.Mock).mockResolvedValue({
      data: uneListeDeDemarches(),
      isStale: false,
    })
    ;(getConseillerServerSide as jest.Mock).mockReturnValue(
      unConseiller({
        id: 'id-conseiller-1',
        structure: structureMilo,
        structureMilo: { nom: 'Agence', id: 'id-test' },
      })
    )
    ;(getMandatorySessionServerSide as jest.Mock).mockReturnValue({
      accessToken: 'accessToken',
      user: { id: 'id-conseiller-1', structure: 'MILO' },
    })
  })

  describe('Quand la session est valide', () => {
    beforeEach(async () => {
      // When
      render(
        await FicheBeneficiaire({
          params: Promise.resolve({ idJeune: 'id-jeune' }),
        })
      )
    })

    it('récupère les infos du jeune', async () => {
      // Then
      expect(getJeuneDetails).toHaveBeenCalledWith('id-jeune', 'accessToken')
      expect(FicheBeneficiairePage).toHaveBeenCalledWith(
        {
          estMilo: true,
          beneficiaire: unDetailBeneficiaire({
            structureMilo: { id: 'id-test' },
          }),
          historiqueConseillers: desConseillersBeneficiaire(),
          rdvs: expect.arrayContaining([]),
          actionsInitiales: expect.objectContaining({}),
          metadonneesFavoris: expect.objectContaining({}),
          favorisOffres: expect.objectContaining({}),
          ongletInitial: 'actions',
          debutSemaineInitiale: undefined,
          erreurSessions: false,
        },
        undefined
      )
    })

    it('récupère les rendez-vous à venir du jeune', async () => {
      // Then
      expect(getRendezVousJeune).toHaveBeenCalledWith(
        'id-beneficiaire-1',
        'FUTURS',
        'accessToken'
      )
      expect(getSessionsMiloBeneficiaire).toHaveBeenCalledWith(
        'id-beneficiaire-1',
        'accessToken',
        now.startOf('day')
      )
      expect(FicheBeneficiairePage).toHaveBeenCalledWith(
        expect.objectContaining({ rdvs: [rdvAVenir, sessionsAVenir] }),
        undefined
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
        undefined
      )
    })

    it('récupère les offres favorites', async () => {
      expect(getOffres).toHaveBeenCalledWith('id-beneficiaire-1', 'accessToken')
      expect(FicheBeneficiairePage).toHaveBeenCalledWith(
        expect.objectContaining({
          favorisOffres: uneListeDOffres(),
        }),
        undefined
      )
    })
  })

  describe('Quand on veut accéder à un onglet spécifique', () => {
    it('récupère l’onglet sur lequel ouvrir la page', async () => {
      // When
      render(
        await FicheBeneficiaire({
          params: Promise.resolve({ idJeune: 'id-jeune' }),
          searchParams: Promise.resolve({ onglet: 'rdvs' }),
        })
      )

      // Then
      expect(FicheBeneficiairePage).toHaveBeenCalledWith(
        expect.objectContaining({ ongletInitial: 'rdvs' }),
        undefined
      )
    })
  })

  describe('Quand on veut accéder à une période spécifique', () => {
    it('récupère la période sur laquelle ouvrir la page', async () => {
      // When
      render(
        await FicheBeneficiaire({
          params: Promise.resolve({ idJeune: 'id-jeune' }),
          searchParams: Promise.resolve({ debut: '2023-04-12' }),
        })
      )

      // Then
      expect(FicheBeneficiairePage).toHaveBeenCalledWith(
        expect.objectContaining({ debutSemaineInitiale: '2023-04-12' }),
        undefined
      )
    })
  })

  describe('Quand le conseiller n’est pas Milo', () => {
    beforeEach(async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockReturnValue({
        accessToken: 'accessToken',
        user: { structure: 'POLE_EMPLOI' },
      })
      ;(getConseillerServerSide as jest.Mock).mockReturnValue(
        unConseiller({
          id: 'id-conseiller-1',
          structure: structureFTCej,
        })
      )

      // When
      render(
        await FicheBeneficiaire({
          params: Promise.resolve({ idJeune: 'id-jeune' }),
        })
      )
    })

    it('ne recupère pas les rendez-vous', async () => {
      // Then
      expect(getRendezVousJeune).not.toHaveBeenCalled()
      expect(getSessionsMiloBeneficiaire).not.toHaveBeenCalled()
      expect(FicheBeneficiairePage).toHaveBeenCalledWith(
        expect.not.objectContaining({ rdvs: expect.arrayContaining([]) }),
        undefined
      )
    })

    it('récupère les offres favorites', async () => {
      expect(getOffres).toHaveBeenCalledWith('id-beneficiaire-1', 'accessToken')
      expect(FicheBeneficiairePage).toHaveBeenCalledWith(
        expect.objectContaining({
          favorisOffres: uneListeDOffres(),
        }),
        undefined
      )
    })

    it('récupère les recherches favorites', async () => {
      expect(getRecherchesSauvegardees).toHaveBeenCalledWith(
        'id-beneficiaire-1',
        'accessToken'
      )
      expect(FicheBeneficiairePage).toHaveBeenCalledWith(
        expect.objectContaining({
          favorisRecherches: uneListeDeRecherches(),
        }),
        undefined
      )
    })
  })

  describe('Quand le conseiller est Conseil Départemental', () => {
    it('récupère les démarches', async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockReturnValue({
        accessToken: 'accessToken',
        user: { structure: 'CONSEIL_DEPT' },
      })
      ;(getConseillerServerSide as jest.Mock).mockReturnValue(
        unConseiller({
          id: 'id-conseiller-1',
          structure: 'CONSEIL_DEPT',
        })
      )

      // When
      render(
        await FicheBeneficiaire({
          params: Promise.resolve({ idJeune: 'id-jeune' }),
        })
      )

      // Then
      expect(getDemarchesBeneficiaire).toHaveBeenCalledWith(
        'id-beneficiaire-1',
        DateTime.now().minus({ day: 30 }).startOf('day'),
        'id-conseiller-1',
        'accessToken'
      )
      expect(FicheBeneficiairePage).toHaveBeenCalledWith(
        expect.objectContaining({
          demarches: {
            data: uneListeDeDemarches(),
            isStale: false,
          },
        }),
        undefined
      )
    })
  })
})

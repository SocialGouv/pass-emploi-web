import { render } from '@testing-library/react'
import { DateTime } from 'luxon'

import FicheBeneficiairePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiairePage'
import FicheBeneficiaire from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/page'
import { uneAction } from 'fixtures/action'
import {
  desConseillersBeneficiaire,
  unDetailBeneficiaire,
  uneListeDeDemarches,
  uneMetadonneeFavoris,
} from 'fixtures/beneficiaire'
import { unConseiller } from 'fixtures/conseiller'
import { dateFuture, dateFutureLoin, datePasseeLoin, now } from 'fixtures/date'
import { unEvenementListItem } from 'fixtures/evenement'
import { uneListeDeRecherches, uneListeDOffres } from 'fixtures/favoris'
import { structureFTCej, structureMilo } from 'interfaces/structure'
import { getActionsBeneficiaireServerSide } from 'services/actions.service'
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
    ;(getRecherchesSauvegardees as jest.Mock).mockResolvedValue(
      uneListeDeRecherches()
    )
    ;(getDemarchesBeneficiaire as jest.Mock).mockResolvedValue({
      data: uneListeDeDemarches(),
      isStale: false,
    })
    ;(getConseillerServerSide as jest.Mock).mockReturnValue(
      unConseiller({
        id: 'id-conseiller',
        structure: structureMilo,
        structureMilo: { nom: 'Agence', id: 'id-test' },
      })
    )
    ;(getMandatorySessionServerSide as jest.Mock).mockReturnValue({
      accessToken: 'accessToken',
      user: { id: 'id-conseiller', structure: 'MILO' },
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
          rdvs: expect.arrayContaining([]),
          actionsInitiales: expect.objectContaining({}),
          metadonneesFavoris: expect.objectContaining({}),
          ongletInitial: 'actions',
          lectureSeule: false,
          erreurSessions: false,
        },
        undefined
      )
    })

    it('récupère les rendez-vous à venir du jeune', async () => {
      // Then
      expect(getRendezVousJeune).toHaveBeenCalledWith(
        'beneficiaire-1',
        'FUTURS',
        'accessToken'
      )
      expect(getSessionsMiloBeneficiaire).toHaveBeenCalledWith(
        'beneficiaire-1',
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

    it('récupère la première page des actions du jeune', async () => {
      // Then
      expect(getActionsBeneficiaireServerSide).toHaveBeenCalledWith(
        'beneficiaire-1',
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
        undefined
      )
    })
  })

  describe('Quand on demande une page d’actions spécifique', () => {
    it('récupère la page demandée des actions du jeune', async () => {
      // When
      render(
        await FicheBeneficiaire({
          params: Promise.resolve({ idJeune: 'id-jeune' }),
          searchParams: Promise.resolve({ page: '3' }),
        })
      )

      // Then
      expect(getActionsBeneficiaireServerSide).toHaveBeenCalledWith(
        'beneficiaire-1',
        3,
        'accessToken'
      )
      expect(FicheBeneficiairePage).toHaveBeenCalledWith(
        expect.objectContaining({
          actionsInitiales: expect.objectContaining({
            page: 3,
          }),
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

  describe('Quand le conseiller n’est pas Milo', () => {
    beforeEach(async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockReturnValue({
        accessToken: 'accessToken',
        user: { structure: 'POLE_EMPLOI' },
      })
      ;(getConseillerServerSide as jest.Mock).mockReturnValue(
        unConseiller({
          id: 'id-conseiller',
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

    it('ne recupère pas les actions', async () => {
      // Then
      expect(getActionsBeneficiaireServerSide).not.toHaveBeenCalled()
      expect(FicheBeneficiairePage).toHaveBeenCalledWith(
        expect.not.objectContaining({
          actionsInitiales: expect.objectContaining({
            actions: expect.arrayContaining([]),
          }),
        }),
        undefined
      )
    })

    it('récupère les offres favorites', async () => {
      expect(getOffres).toHaveBeenCalledWith('beneficiaire-1', 'accessToken')
      expect(FicheBeneficiairePage).toHaveBeenCalledWith(
        expect.objectContaining({
          favorisOffres: uneListeDOffres(),
        }),
        undefined
      )
    })

    it('récupère les recherches favorites', async () => {
      expect(getRecherchesSauvegardees).toHaveBeenCalledWith(
        'beneficiaire-1',
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
          id: 'id-conseiller',
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
        'beneficiaire-1',
        DateTime.now().minus({ day: 30 }).startOf('day'),
        'id-conseiller',
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

  describe('Quand le conseiller est observateur', () => {
    it('prépare la page en lecture seule', async () => {
      // Given
      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(
        unConseiller({ id: 'id-observateur' })
      )

      // When
      render(
        await FicheBeneficiaire({
          params: Promise.resolve({ idJeune: 'id-jeune' }),
        })
      )

      // Then
      expect(getJeuneDetails).toHaveBeenCalledWith('id-jeune', 'accessToken')

      expect(FicheBeneficiairePage).toHaveBeenCalledWith(
        expect.objectContaining({ lectureSeule: true }),
        undefined
      )
    })
  })
})

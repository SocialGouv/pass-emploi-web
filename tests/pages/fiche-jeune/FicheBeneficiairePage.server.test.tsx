import { render } from '@testing-library/react'
import { DateTime } from 'luxon'
import { getServerSession } from 'next-auth'

import FicheBeneficiairePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiairePage'
import FicheBeneficiaire from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/page'
import { uneAction } from 'fixtures/action'
import { unUtilisateur } from 'fixtures/auth'
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
import { StructureConseiller } from 'interfaces/conseiller'
import {
  getActionsBeneficiaireServerSide,
  getDemarchesBeneficiaire,
} from 'services/actions.service'
import { getJeuneDetails } from 'services/beneficiaires.service'
import {
  getConseillersDuJeuneServerSide,
  getConseillerServerSide,
} from 'services/conseillers.service'
import { getRendezVousJeune } from 'services/evenements.service'
import {
  getMetadonneesFavorisJeune,
  getOffres,
  getRecherchesSauvegardees,
} from 'services/favoris.service'
import { getSessionsBeneficiaire } from 'services/sessions.service'

jest.mock(
  'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiairePage'
)
jest.mock('services/beneficiaires.service')
jest.mock('services/sessions.service')
jest.mock('services/evenements.service')
jest.mock('services/actions.service')
jest.mock('services/favoris.service')
jest.mock('services/conseillers.service')
jest.mock('services/referentiel.service')

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
    ;(getSessionsBeneficiaire as jest.Mock).mockResolvedValue([sessionsAVenir])
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
        structure: StructureConseiller.MILO,
        structureMilo: { nom: 'Agence', id: 'id-test' },
      })
    )
  })

  describe('Quand la session est valide', () => {
    beforeEach(async () => {
      // When
      render(await FicheBeneficiaire({ params: { idJeune: 'id-jeune' } }))
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
        {}
      )
    })

    it('récupère les rendez-vous à venir du jeune', async () => {
      // Then
      expect(getRendezVousJeune).toHaveBeenCalledWith(
        'beneficiaire-1',
        'FUTURS',
        'accessToken'
      )
      expect(getSessionsBeneficiaire).toHaveBeenCalledWith(
        'beneficiaire-1',
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
        {}
      )
    })
  })

  describe('Quand on demande une page d’actions spécifique', () => {
    it('récupère la page demandée des actions du jeune', async () => {
      // When
      render(
        await FicheBeneficiaire({
          params: { idJeune: 'id-jeune' },
          searchParams: { page: '3' },
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
        {}
      )
    })
  })

  describe('Quand on veut accéder à un onglet spécifique', () => {
    it('récupère l’onglet sur lequel ouvrir la page', async () => {
      // When
      render(
        await FicheBeneficiaire({
          params: { idJeune: 'id-jeune' },
          searchParams: { onglet: 'rdvs' },
        })
      )

      // Then
      expect(FicheBeneficiairePage).toHaveBeenCalledWith(
        expect.objectContaining({ ongletInitial: 'rdvs' }),
        {}
      )
    })
  })

  describe('Quand le conseiller n’est pas Milo', () => {
    beforeEach(async () => {
      // Given
      ;(getServerSession as jest.Mock).mockResolvedValue({
        accessToken: 'accessToken',
        user: unUtilisateur({ structure: 'POLE_EMPLOI' }),
      })
      ;(getConseillerServerSide as jest.Mock).mockReturnValue(
        unConseiller({
          id: 'id-conseiller',
          structure: StructureConseiller.POLE_EMPLOI,
        })
      )

      // When
      render(await FicheBeneficiaire({ params: { idJeune: 'id-jeune' } }))
    })

    it('ne recupère pas les rendez-vous', async () => {
      // Then
      expect(getRendezVousJeune).not.toHaveBeenCalled()
      expect(getSessionsBeneficiaire).not.toHaveBeenCalled()
      expect(FicheBeneficiairePage).toHaveBeenCalledWith(
        expect.not.objectContaining({ rdvs: expect.arrayContaining([]) }),
        {}
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
        {}
      )
    })

    it('récupère les offres favorites', async () => {
      expect(getOffres).toHaveBeenCalledWith('beneficiaire-1', 'accessToken')
      expect(FicheBeneficiairePage).toHaveBeenCalledWith(
        expect.objectContaining({
          favorisOffres: uneListeDOffres(),
        }),
        {}
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
        {}
      )
    })
  })

  describe('Quand le conseiller est Conseil Départemental', () => {
    it('récupère les démarches', async () => {
      // Given
      ;(getServerSession as jest.Mock).mockResolvedValue({
        accessToken: 'accessToken',
        user: unUtilisateur({ structure: 'CONSEIL_DEPT' }),
      })
      ;(getConseillerServerSide as jest.Mock).mockReturnValue(
        unConseiller({
          id: 'id-conseiller',
          structure: StructureConseiller.CONSEIL_DEPT,
        })
      )

      // When
      render(await FicheBeneficiaire({ params: { idJeune: 'id-jeune' } }))

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
        {}
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

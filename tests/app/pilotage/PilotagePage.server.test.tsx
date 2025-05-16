import { render } from '@testing-library/react'
import { notFound } from 'next/navigation'

import Pilotage from 'app/(connected)/(with-sidebar)/(with-chat)/pilotage/page'
import PilotagePage from 'app/(connected)/(with-sidebar)/(with-chat)/pilotage/PilotagePage'
import { desCategories, uneListeDActionsAQualifier } from 'fixtures/action'
import { unConseiller } from 'fixtures/conseiller'
import {
  uneListeDAnimationCollectiveAClore,
  uneListeDeRendezVousAClore,
} from 'fixtures/evenement'
import { uneListeDeSessionsAClore } from 'fixtures/session'
import { structureMilo } from 'interfaces/structure'
import {
  getActionsAQualifierServerSide,
  getSituationsNonProfessionnelles,
} from 'services/actions.service'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getRdvsEtAnimationsCollectivesACloreServerSide } from 'services/evenements.service'
import { getSessionsACloreServerSide } from 'services/sessions.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

jest.mock('utils/auth/getMandatorySessionServerSide', () => jest.fn())
jest.mock('app/(connected)/(with-sidebar)/(with-chat)/pilotage/PilotagePage')
jest.mock('services/actions.service')
jest.mock('services/sessions.service')
jest.mock('services/conseiller.service')
jest.mock('services/evenements.service')

describe('PilotagePage server side', () => {
  describe('quand le conseiller est France Travail', () => {
    it('renvoie une 404', async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        user: { structure: 'POLE_EMPLOI' },
      })

      // When
      const promise = Pilotage({})

      // Then
      await expect(promise).rejects.toEqual(new Error('NEXT NOT_FOUND'))
      expect(notFound).toHaveBeenCalledWith()
    })
  })

  describe('quand le conseiller est connecté', () => {
    beforeEach(async () => {
      // Given
      ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
        accessToken: 'accessToken',
        user: { id: 'conseiller-id', structure: 'MILO' },
      })
      ;(getActionsAQualifierServerSide as jest.Mock).mockResolvedValue({
        actions: uneListeDActionsAQualifier(),
        metadonnees: {
          nombreTotal: 5,
          nombrePages: 1,
        },
      })
      ;(getSituationsNonProfessionnelles as jest.Mock).mockResolvedValue(
        desCategories()
      )
      ;(getSessionsACloreServerSide as jest.Mock).mockResolvedValue(
        uneListeDeSessionsAClore()
      )
      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(
        unConseiller({
          structure: structureMilo,
          agence: {
            nom: 'Mission Locale Aubenas',
            id: 'id-etablissement',
          },
          structureMilo: {
            nom: 'Mission Locale Aubenas',
            id: 'id-test',
          },
        })
      )
      ;(
        getRdvsEtAnimationsCollectivesACloreServerSide as jest.Mock
      ).mockResolvedValue({
        rdvsEtAnimationsCollectivesInitiaux: [
          ...uneListeDAnimationCollectiveAClore(),
          ...uneListeDeRendezVousAClore(),
        ],
        metadonnees: {
          nombreTotal: 11,
          nombrePages: 2,
        },
      })
    })

    it('prépare la page', async () => {
      // When
      render(await Pilotage({}))

      // Then
      expect(getActionsAQualifierServerSide).toHaveBeenCalledWith(
        'conseiller-id',
        'accessToken'
      )
      expect(getSituationsNonProfessionnelles).toHaveBeenCalledWith(
        { avecNonSNP: false },
        'accessToken'
      )
      expect(getConseillerServerSide).toHaveBeenCalledWith(
        { id: 'conseiller-id', structure: 'MILO' },
        'accessToken'
      )
      expect(
        getRdvsEtAnimationsCollectivesACloreServerSide
      ).toHaveBeenCalledWith('id-conseiller-1', 'accessToken')
      expect(getSessionsACloreServerSide).toHaveBeenCalledWith(
        'conseiller-id',
        'accessToken'
      )
      expect(PilotagePage).toHaveBeenCalledWith(
        {
          actions: {
            donnees: uneListeDActionsAQualifier(),
            metadonnees: { nombreTotal: 5, nombrePages: 1 },
          },
          categoriesActions: desCategories(),
          rdvsEtAnimationsCollectivesInitiaux: {
            donnees: [
              ...uneListeDAnimationCollectiveAClore(),
              ...uneListeDeRendezVousAClore(),
            ],
            metadonnees: {
              nombreAC: 5,
              nombreRdvs: 6,
              nombreTotal: 11,
              nombrePages: 2,
            },
          },
          sessions: uneListeDeSessionsAClore(),
          onglet: 'ACTIONS',
        },
        undefined
      )
    })

    it('ne pète pas si la récupération des sessions échoue', async () => {
      // Given
      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(
        unConseiller({
          structure: structureMilo,
          structureMilo: { id: '06', nom: 'test' },
        })
      )
      ;(getSessionsACloreServerSide as jest.Mock).mockRejectedValueOnce(
        new Error('lol')
      )

      // When
      render(
        await Pilotage({
          searchParams: Promise.resolve({ onglet: 'sessionsImilo' }),
        })
      )

      // Then
      expect(getSessionsACloreServerSide).toHaveBeenCalled()
      expect(PilotagePage).toHaveBeenCalledWith(
        {
          onglet: 'SESSIONS_IMILO',
          actions: {
            donnees: uneListeDActionsAQualifier(),
            metadonnees: { nombreTotal: 5, nombrePages: 1 },
          },
          categoriesActions: desCategories(),
          rdvsEtAnimationsCollectivesInitiaux: {
            donnees: [
              ...uneListeDAnimationCollectiveAClore(),
              ...uneListeDeRendezVousAClore(),
            ],
            metadonnees: {
              nombreAC: 5,
              nombreRdvs: 6,
              nombreTotal: 11,
              nombrePages: 2,
            },
          },
          sessions: undefined,
        },
        undefined
      )
    })
  })
})

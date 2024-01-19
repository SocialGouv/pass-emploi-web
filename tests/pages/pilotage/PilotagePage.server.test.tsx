import { GetServerSidePropsContext } from 'next/types'

import { uneListeDActionsAQualifier } from 'fixtures/action'
import { unConseiller } from 'fixtures/conseiller'
import { uneListeDAnimationCollectiveAClore } from 'fixtures/evenement'
import { uneListeDeSessionsAClore } from 'fixtures/session'
import { StructureConseiller } from 'interfaces/conseiller'
import { getServerSideProps } from 'pages/pilotage'
import { getActionsAQualifierServerSide } from 'services/actions.service'
import { getConseillerServerSide } from 'services/conseiller.service'
import { getAnimationsCollectivesACloreServerSide } from 'services/evenements.service'
import { getSessionsACloreServerSide } from 'services/sessions.service'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/actions.service')
jest.mock('services/evenements.service')
jest.mock('services/conseiller.service')
jest.mock('services/sessions.service')

describe('PilotagePage server side', () => {
  it('requiert une session valide', async () => {
    // Given
    ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
      validSession: false,
      redirect: { destination: 'whatever' },
    })

    // When
    const actual = await getServerSideProps({} as GetServerSidePropsContext)

    // Then
    expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
    expect(actual).toEqual({ redirect: { destination: 'whatever' } })
  })

  describe('quand le conseiller est Pôle emploi', () => {
    it('renvoie une 404', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: true,
        session: {
          user: { structure: 'POLE_EMPLOI' },
        },
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
      expect(actual).toEqual({ notFound: true })
    })
  })

  describe('quand le conseiller est connecté', () => {
    beforeEach(async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: true,
        redirect: { destination: 'whatever' },
        session: {
          accessToken: 'accessToken',
          user: { id: 'conseiller-id' },
        },
      })
      ;(getActionsAQualifierServerSide as jest.Mock).mockResolvedValue({
        actions: uneListeDActionsAQualifier(),
        metadonnees: {
          nombreTotal: 5,
          nombrePages: 1,
        },
      })
      ;(getSessionsACloreServerSide as jest.Mock).mockResolvedValue(
        uneListeDeSessionsAClore()
      )
      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(
        unConseiller({
          structure: StructureConseiller.MILO,
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
        getAnimationsCollectivesACloreServerSide as jest.Mock
      ).mockResolvedValue({
        animationsCollectives: uneListeDAnimationCollectiveAClore(),
        metadonnees: {
          nombreTotal: 5,
          nombrePages: 1,
        },
      })
    })

    it('prépare la page', async () => {
      // When
      const actual = await getServerSideProps({
        query: { onglet: 'actions' },
      } as unknown as GetServerSidePropsContext)

      // Then
      expect(getActionsAQualifierServerSide).toHaveBeenCalledWith(
        'conseiller-id',
        'accessToken'
      )
      expect(getConseillerServerSide).toHaveBeenCalledWith(
        { id: 'conseiller-id' },
        'accessToken'
      )
      expect(getAnimationsCollectivesACloreServerSide).toHaveBeenCalledWith(
        'id-etablissement',
        'accessToken'
      )
      expect(getSessionsACloreServerSide).toHaveBeenCalledWith(
        'conseiller-id',
        'accessToken'
      )
      expect(actual).toEqual({
        props: {
          pageTitle: 'Pilotage',
          actions: {
            donnees: uneListeDActionsAQualifier(),
            metadonnees: { nombreTotal: 5, nombrePages: 1 },
          },
          animationsCollectives: {
            donnees: uneListeDAnimationCollectiveAClore(),
            metadonnees: { nombreTotal: 5, nombrePages: 1 },
          },
          sessions: uneListeDeSessionsAClore(),
          onglet: 'ACTIONS',
        },
      })
    })

    it('ne récupère pas les animations collectives si le conseiller n’a pas renseigné son agence', async () => {
      // Given
      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(unConseiller())

      // When
      const actual = await getServerSideProps({
        query: { onglet: 'animationsCollectives' },
      } as unknown as GetServerSidePropsContext)

      // Then
      expect(getAnimationsCollectivesACloreServerSide).not.toHaveBeenCalled()
      expect(actual).toEqual({
        props: {
          pageTitle: 'Pilotage',
          actions: {
            donnees: uneListeDActionsAQualifier(),
            metadonnees: { nombreTotal: 5, nombrePages: 1 },
          },
          onglet: 'ANIMATIONS_COLLECTIVES',
        },
      })
    })
  })
})

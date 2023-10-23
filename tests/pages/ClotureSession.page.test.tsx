import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { unConseiller } from 'fixtures/conseiller'
import { unDetailSession } from 'fixtures/session'
import { StructureConseiller } from 'interfaces/conseiller'
import { StatutAnimationCollective } from 'interfaces/evenement'
import ClotureSession, {
  getServerSideProps,
} from 'pages/agenda/sessions/[session_id]/cloture'
import { AlerteParam } from 'referentiel/alerteParam'
import { getConseillerServerSide } from 'services/conseiller.service'
import { cloreSession, getDetailsSession } from 'services/sessions.service'
import renderWithContexts from 'tests/renderWithContexts'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/sessions.service')
jest.mock('services/conseiller.service')

describe('Cloture Session', () => {
  describe('client side', () => {
    let session = unDetailSession({
      session: {
        ...unDetailSession().session,
        statut: StatutAnimationCollective.AClore,
      },
      inscriptions: [
        {
          idJeune: 'jeune-1',
          nom: 'Beau',
          prenom: 'Harry',
          statut: 'INSCRIT',
        },
        {
          idJeune: 'jeune-2',
          nom: 'BE',
          prenom: 'Linda',
          statut: 'REFUS_JEUNE',
        },
      ],
    })

    let inscriptionsInitiales = session.inscriptions.map((inscription) => {
      return { idJeune: inscription.idJeune, statut: inscription.statut }
    })

    let alerteSetter: (key: AlerteParam | undefined, target?: string) => void
    let routerPush: jest.Mock

    beforeEach(async () => {
      alerteSetter = jest.fn()
      routerPush = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({
        push: routerPush,
      })

      // When
      renderWithContexts(
        <ClotureSession
          withoutChat={true}
          pageTitle=''
          session={session}
          inscriptionsInitiales={inscriptionsInitiales}
          returnTo='/agenda/sessions/id-session'
        />,
        {
          customAlerte: { alerteSetter },
        }
      )
    })

    it('affiche les bénéficiaires de la session', async () => {
      // THEN
      for (const jeune of session.inscriptions) {
        expect(
          screen.getByText(`${jeune.prenom} ${jeune.nom}`)
        ).toBeInTheDocument()
      }
    })

    it('afficher un bouton pour clore la session', async () => {
      // THEN
      expect(
        screen.getByRole('button', {
          name: 'Clore la session',
        })
      ).toBeInTheDocument()
    })

    it('permet de sélectionner les bénéficiaires', async () => {
      // When - Then
      for (const jeune of session.inscriptions) {
        const ligneJeune = screen.getByRole('checkbox', {
          name: `${jeune.prenom} ${jeune.nom}`,
        })

        await userEvent.click(ligneJeune)
        expect(ligneJeune).toBeChecked()

        await userEvent.click(ligneJeune)
        expect(ligneJeune).not.toBeChecked()
      }
    })

    it('permet de sélectionner tous les bénéficiaires d’un coup', async () => {
      // Given
      const toutSelectionnerCheckbox =
        screen.getByLabelText(/Tout sélectionner/)
      expect(toutSelectionnerCheckbox).not.toBeChecked()

      // When
      await userEvent.click(toutSelectionnerCheckbox)

      // Then
      expect(toutSelectionnerCheckbox).toBeChecked()
    })

    describe('au clic sur le bouton "Clore la session', () => {
      beforeEach(async () => {
        // Given
        await userEvent.click(
          screen.getByText(session.inscriptions[0].prenom, {
            exact: false,
          })
        )
        await userEvent.click(
          screen.getByText(session.inscriptions[1].prenom, {
            exact: false,
          })
        )

        // When
        const clore = screen.getByRole('button', { name: 'Clore la session' })
        expect(clore).toBeInTheDocument()
        await userEvent.click(clore)
      })

      it('clôt la session', async () => {
        // Then
        expect(cloreSession).toHaveBeenCalledWith('1', 'session-1', [
          {
            idJeune: 'jeune-1',
            statut: 'PRESENT',
          },
          {
            idJeune: 'jeune-2',
            statut: 'PRESENT',
          },
        ])
      })

      it('affiche un message de succès', async () => {
        // Then
        expect(alerteSetter).toHaveBeenCalledWith(AlerteParam.clotureSession)
      })

      it('redirige vers le détail de la session', async () => {
        // Then
        expect(routerPush).toHaveBeenCalledWith(
          expect.stringMatching('/agenda/sessions/id-session')
        )
      })
    })
  })

  describe('server side', () => {
    describe("quand l'utilisateur n'est pas connecté", () => {
      it('requiert la connexion', async () => {
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
    })

    describe("quand l'utilisateur est connecté", () => {
      let actual: GetServerSidePropsResult<any>
      beforeEach(() => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: { id: 'id-conseiller', structure: 'MILO' },
            accessToken: 'accessToken',
          },
        })
        ;(getConseillerServerSide as jest.Mock).mockReturnValue(
          unConseiller({
            id: 'id-conseiller',
            structure: StructureConseiller.MILO,
            agence: { nom: 'Agence', id: 'id-test' },
            structureMilo: { nom: 'Agence', id: 'id-test' },
          })
        )
        ;(getDetailsSession as jest.Mock).mockResolvedValue(
          unDetailSession({
            session: {
              id: 'session-1',
              nom: 'titre-session',
              dateHeureDebut: '2023-06-19 10:00:00',
              dateHeureFin: '2023-06-19 17:00:00',
              dateMaxInscription: '2023-06-17',
              animateur: 'Charles Dupont',
              lieu: 'CEJ Paris',
              commentaire: 'bla',
              estVisible: true,
              nbPlacesDisponibles: 20,
              statut: StatutAnimationCollective.AClore,
            },
          })
        )
      })

      it('récupère la session concernée', async () => {
        // When
        actual = await getServerSideProps({
          req: { headers: {} },
          query: {
            redirectUrl: 'redirectUrl',
            session_id: 'id-session',
          },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(getDetailsSession).toHaveBeenCalledWith(
          'id-conseiller',
          'id-session',
          'accessToken'
        )
        expect(actual).toEqual({
          props: {
            session: unDetailSession({
              session: {
                id: 'session-1',
                nom: 'titre-session',
                dateHeureDebut: '2023-06-19 10:00:00',
                dateHeureFin: '2023-06-19 17:00:00',
                dateMaxInscription: '2023-06-17',
                animateur: 'Charles Dupont',
                lieu: 'CEJ Paris',
                commentaire: 'bla',
                estVisible: true,
                nbPlacesDisponibles: 20,
                statut: StatutAnimationCollective.AClore,
              },
            }),
            inscriptionsInitiales: [
              {
                idJeune: 'jeune-1',
                statut: 'INSCRIT',
              },
            ],
            returnTo: '/agenda/sessions/session-1?redirectUrl=redirectUrl',
            pageTitle: 'Clore - Session aide',
            pageHeader: 'Clôture de la session',
            withoutChat: true,
          },
        })
      })

      it("renvoie une 404 si la session n'existe pas", async () => {
        // Given
        ;(getDetailsSession as jest.Mock).mockResolvedValue(undefined)

        // When
        actual = await getServerSideProps({
          req: { headers: {} },
          query: {},
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({ notFound: true })
      })

      it("renvoie une 404 si la session n'est pas à clore", async () => {
        // Given
        ;(getDetailsSession as jest.Mock).mockResolvedValue(
          unDetailSession({
            session: {
              id: 'session-1',
              nom: 'titre-session',
              dateHeureDebut: '2023-06-19 10:00:00',
              dateHeureFin: '2023-06-19 17:00:00',
              dateMaxInscription: '2023-06-17',
              animateur: 'Charles Dupont',
              lieu: 'CEJ Paris',
              commentaire: 'bla',
              estVisible: true,
              nbPlacesDisponibles: 20,
              statut: StatutAnimationCollective.AVenir,
            },
          })
        )

        // When
        actual = await getServerSideProps({
          req: { headers: {} },
          query: {},
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({ notFound: true })
      })
    })

    describe('quand l’utilisateur est Pôle Emploi', () => {
      it('renvoie sur la liste des bénéficiaires', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
          validSession: true,
          session: {
            user: {
              id: 'id-conseiller',
              structure: StructureConseiller.POLE_EMPLOI,
            },
            accessToken: 'accessToken',
          },
        })
        ;(getConseillerServerSide as jest.Mock).mockReturnValue(unConseiller())

        // When
        const actual = await getServerSideProps({
          req: { headers: {} },
          query: {},
        } as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({
          redirect: { destination: '/mes-jeunes', permanent: false },
        })
      })
    })
  })
})

import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { uneListeDActionsAQualifier } from 'fixtures/action'
import { unConseiller } from 'fixtures/conseiller'
import { uneListeDAnimationCollectiveAClore } from 'fixtures/evenement'
import {
  mockedActionsService,
  mockedConseillerService,
  mockedEvenementsService,
} from 'fixtures/services'
import { ActionPilotage } from 'interfaces/action'
import { AnimationCollectivePilotage } from 'interfaces/evenement'
import Pilotage, { getServerSideProps } from 'pages/pilotage'
import { ActionsService } from 'services/actions.service'
import { ConseillerService } from 'services/conseiller.service'
import { EvenementsService } from 'services/evenements.service'
import renderWithContexts from 'tests/renderWithContexts'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')

describe('Pilotage', () => {
  describe('Client side', () => {
    describe('contenu', () => {
      let actions: ActionPilotage[]
      let animationsCollectives: AnimationCollectivePilotage[]
      let actionsService: ActionsService
      let evenementsService: EvenementsService
      beforeEach(async () => {
        actions = uneListeDActionsAQualifier()
        animationsCollectives = uneListeDAnimationCollectiveAClore()
        actionsService = mockedActionsService({
          getActionsAQualifierClientSide: jest.fn(async (_, page) => ({
            actions: [
              {
                id: 'action-page-' + page,
                titre: 'Action page ' + page,
                beneficiaire: {
                  id: 'hermione',
                  nom: 'Granger',
                  prenom: 'Hermione',
                },
                dateFinReelle: '18/12/2022',
              },
            ],
            metadonnees: { nombrePages: 3, nombreTotal: 25 },
          })),
        })
        evenementsService = mockedEvenementsService({
          getRendezVousACloreClientSide: jest.fn(async (_, page) => ({
            evenements: [
              {
                id: 'evenement-page-' + page,
                titre: 'Animation page ' + page,
                date: '2018-11-21T06:20:32.232Z',
                nombreInscrits: 5,
              },
            ],
            metadonnees: { nombrePages: 3, nombreTotal: 25 },
          })),
        })
        ;(useRouter as jest.Mock).mockReturnValue({ replace: jest.fn() })

        renderWithContexts(
          <Pilotage
            pageTitle=''
            actions={{
              donnees: uneListeDActionsAQualifier(),
              metadonnees: { nombrePages: 3, nombreTotal: 25 },
            }}
            evenements={{
              donnees: uneListeDAnimationCollectiveAClore(),
              metadonnees: { nombrePages: 3, nombreTotal: 25 },
            }}
          />,
          {
            customDependances: { actionsService, evenementsService },
            customConseiller: {
              agence: { nom: 'Mission locale Aubenas', id: 'id-etablissement' },
            },
          }
        )
      })

      describe('actions', () => {
        it('affiche un tableau d’actions à qualifier ', () => {
          // Given
          const tableauDActions = screen.getByRole('table', {
            name: 'Liste des actions à qualifier',
          })

          // Then
          expect(
            within(tableauDActions).getByRole('columnheader', {
              name: 'Bénéficiaire',
            })
          ).toBeInTheDocument()
          expect(
            within(tableauDActions).getByRole('columnheader', {
              name: 'Date de réalisation',
            })
          ).toBeInTheDocument()
          expect(
            within(tableauDActions).getByRole('columnheader', {
              name: 'Titre de l’action',
            })
          ).toBeInTheDocument()
        })

        it('affiche les actions du conseiller à qualifier', async () => {
          // Then
          actions.forEach((action) => {
            expect(screen.getByText(action.titre)).toBeInTheDocument()
            expect(screen.getByText(action.dateFinReelle)).toBeInTheDocument()
            expect(
              screen.getByText(
                `${action.beneficiaire.nom} ${action.beneficiaire.prenom}`
              )
            ).toBeInTheDocument()
            expect(
              screen.getByLabelText(
                `Accéder au détail de l’action : ${action.titre}`
              )
            ).toHaveAttribute(
              'href',
              `/mes-jeunes/${action.beneficiaire.id}/actions/${action.id}`
            )
          })
        })

        it('met à jour les actions avec la page demandée ', async () => {
          // When
          await userEvent.click(screen.getByLabelText('Page 2'))

          // Then
          expect(
            actionsService.getActionsAQualifierClientSide
          ).toHaveBeenCalledWith('1', 2)
          expect(screen.getByText('Action page 2')).toBeInTheDocument()
        })

        it("permet d'accéder aux animations collectives", async () => {
          // When
          await userEvent.click(
            screen.getByRole('tab', { name: 'Animations à clore 25' })
          )

          // Then
          expect(
            screen.getByRole('tab', { selected: true })
          ).toHaveAccessibleName('Animations à clore 25')
          expect(
            screen.getByRole('table', {
              name: 'Liste des animations collectives à clore',
            })
          ).toBeInTheDocument()
        })
      })

      describe('animations collectives', () => {
        beforeEach(async () => {
          // Given
          await userEvent.click(
            screen.getByRole('tab', { name: 'Animations à clore 25' })
          )
        })

        it('affiche un tableau d’animations collectives à clore ', () => {
          // Given
          const tableau = screen.getByRole('table', {
            name: 'Liste des animations collectives à clore',
          })

          // Then
          expect(
            within(tableau).getByRole('columnheader', { name: 'Date' })
          ).toBeInTheDocument()
          expect(
            within(tableau).getByRole('columnheader', {
              name: 'Titre de l’animation collective',
            })
          ).toBeInTheDocument()
          expect(
            within(tableau).getByRole('columnheader', {
              name: 'Participants',
            })
          ).toBeInTheDocument()
        })

        it('affiche les animations collectives de l’établissement à clore', async () => {
          // Given
          const tableau = screen.getByRole('table', {
            name: 'Liste des animations collectives à clore',
          })

          // Then
          animationsCollectives.forEach((animation) => {
            expect(
              within(tableau).getByText(animation.date)
            ).toBeInTheDocument()
            expect(
              within(tableau).getByText(animation.titre)
            ).toBeInTheDocument()
            expect(
              within(tableau).getByText(`${animation.nombreInscrits}`)
            ).toBeInTheDocument()
            expect(
              within(tableau).getByLabelText(
                `Accéder au détail de l’animation collective : ${animation.titre}`
              )
            ).toHaveAttribute(
              'href',
              '/mes-jeunes/edition-rdv?idRdv=' + animation.id
            )
          })
        })

        it("permet d'accéder aux actions", async () => {
          // When
          await userEvent.click(
            screen.getByRole('tab', { name: 'Actions à qualifier 25' })
          )

          // Then
          expect(
            screen.getByRole('tab', { selected: true })
          ).toHaveAccessibleName('Actions à qualifier 25')
          expect(
            screen.getByRole('table', {
              name: 'Liste des actions à qualifier',
            })
          ).toBeInTheDocument()
        })

        it('met à jour les animations avec la page demandée ', async () => {
          // When
          await userEvent.click(screen.getByLabelText('Page 2'))

          // Then
          expect(
            evenementsService.getRendezVousACloreClientSide
          ).toHaveBeenCalledWith('id-etablissement', 2)
          expect(screen.getByText('Animation page 2')).toBeInTheDocument()
        })
      })
    })

    describe("quand le conseiller n'a pas d'action à qualifier", () => {
      it('affiche un message qui le précise', async () => {
        // When
        renderWithContexts(
          <Pilotage
            withoutChat={true}
            pageTitle=''
            actions={{
              donnees: [],
              metadonnees: { nombrePages: 1, nombreTotal: 0 },
            }}
            evenements={{
              donnees: [],
              metadonnees: { nombrePages: 1, nombreTotal: 0 },
            }}
          />
        )

        // Then
        expect(
          screen.getByText('Vous n’avez pas d’action à qualifier.')
        ).toBeInTheDocument()
      })
    })

    describe("quand le conseiller n'a pas d'animation collective à clore", () => {
      it('affiche un message qui le précise', async () => {
        // Given
        renderWithContexts(
          <Pilotage
            withoutChat={true}
            pageTitle=''
            actions={{
              donnees: [],
              metadonnees: { nombrePages: 1, nombreTotal: 0 },
            }}
            evenements={{
              donnees: [],
              metadonnees: { nombrePages: 1, nombreTotal: 0 },
            }}
          />
        )

        // When
        await userEvent.click(
          screen.getByRole('tab', { name: /Animations à clore/ })
        )

        // Then
        expect(
          screen.getByText('Vous n’avez pas d’animation collective à clore.')
        ).toBeInTheDocument()
      })
    })

    describe('quand le conseiller n’a pas renseignée son agence', () => {
      it('affiche un message qui le précise', async () => {
        // Given
        let actionsService: ActionsService
        actionsService = mockedActionsService({
          getActionsAQualifierClientSide: jest.fn(),
        })
        renderWithContexts(
          <Pilotage
            withoutChat={true}
            pageTitle=''
            actions={{
              donnees: [],
              metadonnees: { nombrePages: 1, nombreTotal: 0 },
            }}
          />,
          { customDependances: { actionsService } }
        )

        // When
        await userEvent.click(
          screen.getByRole('tab', { name: /Animations à clore/ })
        )

        // Then
        expect(
          screen.getByText(
            'Vous devez renseigner votre Mission locale pour pouvoir consulter ses animations collectives.'
          )
        ).toBeInTheDocument()
      })
    })
  })

  describe('Server side', () => {
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

    describe('quand le conseiller est Pole emploi', () => {
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
      let actionsService: ActionsService
      let conseillerService: ConseillerService
      let evenementsService: EvenementsService
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

        actionsService = mockedActionsService({
          getActionsAQualifierServerSide: jest.fn(async () => ({
            actions: uneListeDActionsAQualifier(),
            metadonnees: {
              nombreTotal: 5,
              nombrePages: 1,
            },
          })),
        })
        conseillerService = mockedConseillerService({
          getConseillerServerSide: jest.fn(async () =>
            unConseiller({
              agence: {
                nom: 'Mission locale Aubenas',
                id: 'id-etablissement',
              },
            })
          ),
        })
        evenementsService = mockedEvenementsService({
          getRendezVousACloreServerSide: jest.fn(async () => ({
            evenements: uneListeDAnimationCollectiveAClore(),
            metadonnees: {
              nombreTotal: 5,
              nombrePages: 1,
            },
          })),
        })
        ;(withDependance as jest.Mock).mockImplementation((dependance) => {
          if (dependance === 'actionsService') return actionsService
          if (dependance === 'conseillerService') return conseillerService
          if (dependance === 'evenementsService') return evenementsService
        })
      })

      it('prépare la page', async () => {
        // When
        const actual = await getServerSideProps({
          query: { onglet: 'actions' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(
          actionsService.getActionsAQualifierServerSide
        ).toHaveBeenCalledWith('conseiller-id', 'accessToken')
        expect(conseillerService.getConseillerServerSide).toHaveBeenCalledWith(
          { id: 'conseiller-id' },
          'accessToken'
        )
        expect(
          evenementsService.getRendezVousACloreServerSide
        ).toHaveBeenCalledWith('id-etablissement', 'accessToken')
        expect(actual).toEqual({
          props: {
            pageTitle: 'Pilotage',
            actions: {
              donnees: uneListeDActionsAQualifier(),
              metadonnees: { nombreTotal: 5, nombrePages: 1 },
            },
            evenements: {
              donnees: uneListeDAnimationCollectiveAClore(),
              metadonnees: { nombreTotal: 5, nombrePages: 1 },
            },
            onglet: 'ACTIONS',
          },
        })
      })

      it('ne récupère pas les animations collectives si le conseiller n’a pas renseignée son agence', async () => {
        // Given
        ;(
          conseillerService.getConseillerServerSide as jest.Mock
        ).mockResolvedValue(
          unConseiller({
            agence: {
              nom: 'Mission locale Aubenas',
            },
          })
        )

        // When
        const actual = await getServerSideProps({
          query: { onglet: 'evenements' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(
          evenementsService.getRendezVousACloreServerSide
        ).not.toHaveBeenCalled()
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
})

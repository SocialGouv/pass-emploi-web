import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { uneListeDActionsAQualifier } from 'fixtures/action'
import { unConseiller } from 'fixtures/conseiller'
import { uneListeDAnimationCollectiveAClore } from 'fixtures/evenement'
import { uneListeDAgencesMILO } from 'fixtures/referentiel'
import { ActionPilotage } from 'interfaces/action'
import { StructureConseiller } from 'interfaces/conseiller'
import { AnimationCollectivePilotage } from 'interfaces/evenement'
import { Agence } from 'interfaces/referentiel'
import Pilotage, { getServerSideProps } from 'pages/pilotage'
import {
  getActionsAQualifierClientSide,
  getActionsAQualifierServerSide,
} from 'services/actions.service'
import {
  getConseillerServerSide,
  modifierAgence,
} from 'services/conseiller.service'
import {
  getAnimationsCollectivesACloreClientSide,
  getAnimationsCollectivesACloreServerSide,
} from 'services/evenements.service'
import { getAgencesClientSide } from 'services/referentiel.service'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/actions.service')
jest.mock('services/evenements.service')
jest.mock('services/referentiel.service')
jest.mock('services/conseiller.service')
jest.mock('components/Modal')

describe('Pilotage', () => {
  describe('Client side', () => {
    describe('contenu', () => {
      let actions: ActionPilotage[]
      let animationsCollectives: AnimationCollectivePilotage[]

      beforeEach(async () => {
        actions = uneListeDActionsAQualifier()
        animationsCollectives = uneListeDAnimationCollectiveAClore()
        ;(getActionsAQualifierClientSide as jest.Mock).mockImplementation(
          async (_, page) => ({
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
          })
        )
        ;(
          getAnimationsCollectivesACloreClientSide as jest.Mock
        ).mockImplementation(async (_, page) => ({
          animationsCollectives: [
            {
              id: 'evenement-page-' + page,
              titre: 'Animation page ' + page,
              date: '2018-11-21T06:20:32.232Z',
              nombreInscrits: 5,
            },
          ],
          metadonnees: { nombrePages: 3, nombreTotal: 25 },
        }))
        ;(useRouter as jest.Mock).mockReturnValue({ replace: jest.fn() })

        renderWithContexts(
          <Pilotage
            pageTitle=''
            actions={{
              donnees: uneListeDActionsAQualifier(),
              metadonnees: { nombrePages: 3, nombreTotal: 25 },
            }}
            animationsCollectives={{
              donnees: uneListeDAnimationCollectiveAClore(),
              metadonnees: { nombrePages: 3, nombreTotal: 25 },
            }}
          />,
          {
            customConseiller: {
              agence: { nom: 'Mission Locale Aubenas', id: 'id-etablissement' },
            },
          }
        )
      })

      it('résume les activités', async () => {
        // Then
        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
          'Nouvelles activités'
        )
        expect(getByDescriptionTerm('Les actions')).toHaveTextContent(
          '25 À qualifier'
        )
        expect(getByDescriptionTerm('Les animations')).toHaveTextContent(
          '25 À clore'
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
          expect(getActionsAQualifierClientSide).toHaveBeenCalledWith('1', 2)
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
          expect(getAnimationsCollectivesACloreClientSide).toHaveBeenCalledWith(
            'id-etablissement',
            2
          )
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
              metadonnees: { nombrePages: 0, nombreTotal: 0 },
            }}
            animationsCollectives={{
              donnees: [],
              metadonnees: { nombrePages: 0, nombreTotal: 0 },
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
        ;(useRouter as jest.Mock).mockReturnValue({ replace: jest.fn() })
        renderWithContexts(
          <Pilotage
            withoutChat={true}
            pageTitle=''
            actions={{
              donnees: [],
              metadonnees: { nombrePages: 0, nombreTotal: 0 },
            }}
            animationsCollectives={{
              donnees: [],
              metadonnees: { nombrePages: 0, nombreTotal: 0 },
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

    describe('quand le conseiller n’a pas renseigné son agence', () => {
      let agences: Agence[]

      beforeEach(async () => {
        agences = uneListeDAgencesMILO()
        ;(getAgencesClientSide as jest.Mock).mockResolvedValue(agences)
        ;(
          getAnimationsCollectivesACloreClientSide as jest.Mock
        ).mockImplementation(async (_, page) => ({
          animationsCollectives: [
            {
              id: 'evenement-page-' + page,
              titre: 'Animation page ' + page,
              date: '2018-11-21T06:20:32.232Z',
              nombreInscrits: 5,
            },
          ],
          metadonnees: { nombrePages: 3, nombreTotal: 25 },
        }))
        ;(useRouter as jest.Mock).mockReturnValue({ replace: jest.fn() })

        // When
        await act(async () => {
          renderWithContexts(
            <Pilotage
              pageTitle=''
              actions={{
                donnees: [],
                metadonnees: { nombrePages: 0, nombreTotal: 0 },
              }}
            />,
            {
              customConseiller: { structure: StructureConseiller.MILO },
            }
          )
        })

        // When
        await userEvent.click(
          screen.getByRole('tab', { name: /Animations à clore/ })
        )
      })

      it('n’affiche pas la liste des animations à clore', async () => {
        // Then
        expect(() =>
          screen.getByRole('table', {
            name: 'Liste des animations collectives à clore',
          })
        ).toThrow()
      })

      it('demande de renseigner son agence', async () => {
        // Then
        expect(
          screen.getByText(/Votre Mission Locale n’est pas renseignée/)
        ).toBeInTheDocument()

        expect(
          screen.getByRole('button', {
            name: 'Renseigner votre Mission Locale',
          })
        ).toBeInTheDocument()
      })

      it('permet de renseigner son agence', async () => {
        // When
        await userEvent.click(
          screen.getByRole('button', {
            name: 'Renseigner votre Mission Locale',
          })
        )

        // Then
        expect(getAgencesClientSide).toHaveBeenCalledWith(
          StructureConseiller.MILO
        )
        expect(screen.getByRole('combobox')).toBeInTheDocument()
        agences.forEach((agence) =>
          expect(
            screen.getByRole('option', { hidden: true, name: agence.nom })
          ).toBeInTheDocument()
        )
      })

      it('sauvegarde l’agence et affiche la liste des animations collectives à clore de l’agence', async () => {
        // Given
        await userEvent.click(
          screen.getByRole('button', {
            name: 'Renseigner votre Mission Locale',
          })
        )
        const agence = agences[2]
        const searchAgence = screen.getByRole('combobox', {
          name: /votre Mission Locale/,
        })
        const submit = screen.getByRole('button', { name: 'Ajouter' })

        // When
        await userEvent.selectOptions(searchAgence, agence.nom)
        await userEvent.click(submit)

        // Then
        expect(modifierAgence).toHaveBeenCalledWith({
          id: agence.id,
          nom: agence.nom,
          codeDepartement: '3',
        })
        expect(
          screen.queryByText('Votre Mission Locale n’est pas renseignée')
        ).not.toBeInTheDocument()
        expect(
          screen.getByRole('table', {
            name: 'Liste des animations collectives à clore',
          })
        ).toBeInTheDocument()
      })
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
      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(
        unConseiller({
          agence: {
            nom: 'Mission Locale Aubenas',
            id: 'id-etablissement',
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
          onglet: 'ACTIONS',
        },
      })
    })

    it('ne récupère pas les animations collectives si le conseiller n’a pas renseigné son agence', async () => {
      // Given
      ;(getConseillerServerSide as jest.Mock).mockResolvedValue(
        unConseiller({
          agence: {
            nom: 'Mission Locale Aubenas',
          },
        })
      )

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

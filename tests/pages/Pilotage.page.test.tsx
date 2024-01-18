import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { uneListeDActionsAQualifier } from 'fixtures/action'
import { unConseiller } from 'fixtures/conseiller'
import { uneListeDAnimationCollectiveAClore } from 'fixtures/evenement'
import { uneListeDAgencesMILO } from 'fixtures/referentiel'
import { uneListeDeSessionsAClore } from 'fixtures/session'
import { ActionPilotage } from 'interfaces/action'
import { StructureConseiller } from 'interfaces/conseiller'
import { AnimationCollectivePilotage } from 'interfaces/evenement'
import { Agence } from 'interfaces/referentiel'
import Pilotage, { getServerSideProps } from 'pages/pilotage'
import {
  getActionsAQualifierClientSide,
  getActionsAQualifierServerSide,
  qualifierActions,
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
import {
  getSessionsACloreServerSide,
  SessionsAClore,
} from 'services/sessions.service'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'
import withMandatorySessionOrRedirect from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('services/actions.service')
jest.mock('services/evenements.service')
jest.mock('services/referentiel.service')
jest.mock('services/conseiller.service')
jest.mock('services/sessions.service')
jest.mock('components/Modal')

describe('Pilotage', () => {
  describe('Client side', () => {
    describe('contenu', () => {
      let actions: ActionPilotage[]
      let animationsCollectives: AnimationCollectivePilotage[]
      let sessions: SessionsAClore[]
      let actionSansCategorie: ActionPilotage

      beforeEach(async () => {
        actions = uneListeDActionsAQualifier()
        animationsCollectives = uneListeDAnimationCollectiveAClore()
        sessions = uneListeDeSessionsAClore()
        actionSansCategorie = {
          id: '009347ea-4acb-4b61-9e08-b6caf38e2812',
          titre: 'Regarder Tchoupi faire du tricycle',
          beneficiaire: {
            id: 'tchoupi',
            nom: 'Trotro',
            prenom: 'L’âne',
          },
          dateFinReelle: '16/01/2024',
        }
        ;(getActionsAQualifierClientSide as jest.Mock).mockImplementation(
          async (_, { page, tri }) => ({
            actions: [
              {
                id: `action-page-${page}-${tri}`,
                titre: `Action page ${page} ${tri}`,
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
        ;(getSessionsACloreServerSide as jest.Mock).mockImplementation(
          async () => {}
        )
        ;(qualifierActions as jest.Mock).mockResolvedValue({
          idsActionsEnErreur: [],
        })
        ;(useRouter as jest.Mock).mockReturnValue({ replace: jest.fn() })

        await act(async () =>
          renderWithContexts(
            <Pilotage
              pageTitle=''
              actions={{
                donnees: [...uneListeDActionsAQualifier(), actionSansCategorie],
                metadonnees: { nombrePages: 3, nombreTotal: 25 },
              }}
              animationsCollectives={{
                donnees: uneListeDAnimationCollectiveAClore(),
                metadonnees: { nombrePages: 3, nombreTotal: 25 },
              }}
              sessions={sessions}
            />,
            {
              customConseiller: {
                structure: StructureConseiller.MILO,
                agence: {
                  nom: 'Mission Locale Aubenas',
                  id: 'id-test',
                },
                structureMilo: {
                  nom: 'Mission Locale Aubenas',
                  id: 'id-test',
                },
              },
            }
          )
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
        expect(getByDescriptionTerm('Sessions i-milo')).toHaveTextContent(
          '3 À clore'
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
          expect(
            within(tableauDActions).getByRole('columnheader', {
              name: 'Catégorie',
            })
          ).toBeInTheDocument()
        })

        it('affiche information catégorie manquante', async () => {
          // Then
          expect(
            within(
              screen.getByRole('row', {
                name: /Regarder Tchoupi faire du tricycle/,
              })
            ).getByText('Catégorie manquante')
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
            expect(
              screen.getByText(action.categorie!.libelle)
            ).toBeInTheDocument()
          })
        })

        it('permet de trier les actions par nom du bénéficiaire par ordre alphabétique', async () => {
          //When
          await userEvent.click(
            screen.getByRole('button', {
              name: 'Afficher la liste des bénéficiaires triée par noms de famille par ordre alphabétique',
            })
          )

          // Then
          expect(getActionsAQualifierClientSide).toHaveBeenCalledWith('1', {
            page: 1,
            tri: 'ALPHABETIQUE',
          })
          expect(
            screen.getByText('Action page 1 ALPHABETIQUE')
          ).toBeInTheDocument()
        })

        it('permet de trier les actions par nom du bénéficiaire par ordre alphabétique inversé', async () => {
          //When
          await userEvent.click(
            screen.getByRole('button', {
              name: 'Afficher la liste des bénéficiaires triée par noms de famille par ordre alphabétique',
            })
          )

          await userEvent.click(
            screen.getByRole('button', {
              name: 'Afficher la liste des bénéficiaires triée par noms de famille par ordre alphabétique inversé',
            })
          )

          // Then
          expect(getActionsAQualifierClientSide).toHaveBeenCalledWith('1', {
            page: 1,
            tri: 'INVERSE',
          })
          expect(screen.getByText('Action page 1 INVERSE')).toBeInTheDocument()
        })

        it('met à jour les actions avec la page demandée ', async () => {
          // When
          await userEvent.click(
            screen.getByRole('button', {
              name: 'Afficher la liste des bénéficiaires triée par noms de famille par ordre alphabétique',
            })
          )
          await userEvent.click(screen.getByLabelText('Page 2'))

          // Then
          expect(getActionsAQualifierClientSide).toHaveBeenCalledWith('1', {
            page: 2,
            tri: 'ALPHABETIQUE',
          })
          expect(
            screen.getByText('Action page 2 ALPHABETIQUE')
          ).toBeInTheDocument()
        })

        it("permet d'accéder aux animations collectives", async () => {
          // When
          await userEvent.click(screen.getByRole('tab', { name: 'Actions 25' }))

          // Then
          expect(
            screen.getByRole('tab', { selected: true })
          ).toHaveAccessibleName('Actions 25')
          expect(
            screen.getByRole('table', {
              name: 'Liste des actions à qualifier',
            })
          ).toBeInTheDocument()
        })

        describe('multi-qualification', () => {
          describe('quand aucune action n’est sélectionnée', () => {
            it('invite à sélectionner une action', () => {
              expect(
                screen.getByText(
                  'Sélectionnez au moins un élément ci-dessous pour commencer à qualifier'
                )
              ).toBeInTheDocument()
            })

            it('désactive la qualification en SNP', () => {
              expect(
                screen.getByRole('button', {
                  name: 'Qualifier les actions en SNP',
                })
              ).toHaveAttribute('disabled')
            })
          })

          describe('quand une action est sélectionnée', () => {
            beforeEach(async () => {
              await userEvent.click(
                screen.getByRole('checkbox', {
                  name: `Sélection ${actions[0].titre} ${actions[0].categorie?.libelle ?? ''}`,
                })
              )
            })

            it('permet de qualifier l’action', () => {
              //Then
              expect(
                screen.getByText(
                  '1 action sélectionnée. S’agit-il de SNP ou de non SNP ?'
                )
              ).toBeInTheDocument()
              expect(
                screen.getByRole('button', {
                  name: 'Qualifier les actions en SNP',
                })
              ).not.toHaveAttribute('disabled')
            })

            describe('quand le conseiller qualifie en SNP', () => {
              beforeEach(async () => {
                await userEvent.click(
                  screen.getByRole('button', {
                    name: 'Qualifier les actions en SNP',
                  })
                )
              })

              it('affiche la modale de qualification en SNP', () => {
                expect(
                  screen.getByText(
                    `Qualifier l’action de ${actions[0].beneficiaire.prenom} ${actions[0].beneficiaire.nom} en SNP ?`
                  )
                ).toBeInTheDocument()
                expect(
                  screen.getByText(
                    'Les informations seront envoyées à i-milo, qui comptera automatiquement les heures associées à chaque type de SNP.'
                  )
                ).toBeInTheDocument()
                expect(
                  screen.getByRole('button', { name: 'Annuler' })
                ).toBeInTheDocument()
                expect(
                  screen.getByRole('button', {
                    name: 'Qualifier et envoyer à i-milo',
                  })
                ).toBeInTheDocument()
              })

              it('qualifie l’action', async () => {
                //When
                await userEvent.click(
                  screen.getByRole('button', {
                    name: 'Qualifier et envoyer à i-milo',
                  })
                )

                //Then
                expect(qualifierActions).toHaveBeenCalledWith(
                  [
                    {
                      codeQualification: actions[0].categorie!.code,
                      idAction: actions[0].id,
                    },
                  ],
                  true
                )
              })
            })
          })
        })
      })

      describe('animations collectives', () => {
        beforeEach(async () => {
          // Given
          await userEvent.click(
            screen.getByRole('tab', { name: 'AC app CEJ 25' })
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
            screen.getByRole('tab', { name: 'AC app CEJ 25' })
          )

          // Then
          expect(
            screen.getByRole('tab', { selected: true })
          ).toHaveAccessibleName('AC app CEJ 25')
          expect(
            screen.getByRole('table', {
              name: 'Liste des animations collectives à clore',
            })
          ).toBeInTheDocument()
        })

        it('met à jour les animations avec la page demandée ', async () => {
          // When
          await userEvent.click(screen.getByLabelText('Page 2'))

          // Then
          expect(getAnimationsCollectivesACloreClientSide).toHaveBeenCalledWith(
            'id-test',
            2
          )
          expect(screen.getByText('Animation page 2')).toBeInTheDocument()
        })
      })

      describe('sessions i-milo', () => {
        beforeEach(async () => {
          // Given
          await userEvent.click(
            screen.getByRole('tab', { name: 'Sessions i-milo 3' })
          )
        })

        it('affiche un tableau de sessions à clore ', () => {
          // Given
          const tableau = screen.getByRole('table', {
            name: 'Liste des sessions i-milo à clore',
          })

          // Then
          expect(
            within(tableau).getByRole('columnheader', { name: 'Date' })
          ).toBeInTheDocument()
          expect(
            within(tableau).getByRole('columnheader', {
              name: 'Titre de la session',
            })
          ).toBeInTheDocument()
        })

        it('affiche les sessions i-milo de l’établissement à clore', async () => {
          // Given
          const tableau = screen.getByRole('table', {
            name: 'Liste des sessions i-milo à clore',
          })

          // Then
          sessions.forEach((session) => {
            expect(within(tableau).getByText(session.date)).toBeInTheDocument()
            expect(within(tableau).getByText(session.titre)).toBeInTheDocument()
            expect(
              within(tableau).getByLabelText(
                `Accéder au détail de la session : ${session.titre}`
              )
            ).toHaveAttribute('href', '/agenda/sessions/' + session.id)
          })
        })

        it("permet d'accéder aux sessions", async () => {
          // When
          await userEvent.click(
            screen.getByRole('tab', { name: 'Sessions i-milo 3' })
          )

          // Then
          expect(
            screen.getByRole('tab', { selected: true })
          ).toHaveAccessibleName('Sessions i-milo 3')
          expect(
            screen.getByRole('table', {
              name: 'Liste des sessions i-milo à clore',
            })
          ).toBeInTheDocument()
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
        await userEvent.click(screen.getByRole('tab', { name: /AC app CEJ/ }))

        // Then
        expect(
          screen.getByText('Vous n’avez pas d’animation collective à clore.')
        ).toBeInTheDocument()
      })
    })

    describe("quand le conseiller n'a pas de session à clore", () => {
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
            sessions={[]}
          />,
          {
            customConseiller: {
              structure: StructureConseiller.MILO,
              agence: {
                nom: 'Mission Locale Aubenas',
                id: 'id-test',
              },
              structureMilo: {
                nom: 'Mission Locale Aubenas',
                id: 'id-test',
              },
            },
          }
        )

        // When
        await userEvent.click(
          screen.getByRole('tab', { name: /Sessions i-milo/ })
        )

        // Then
        expect(
          screen.getByText('Vous n’avez pas de session à clore.')
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
        await userEvent.click(screen.getByRole('tab', { name: /AC app CEJ/ }))
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
        await waitFor(() => {
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
        ;(getConseillerServerSide as jest.Mock).mockResolvedValue(
          unConseiller()
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
})

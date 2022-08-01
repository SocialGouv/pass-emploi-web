import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { GetServerSidePropsResult } from 'next'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next/types'
import React from 'react'

import { uneAction, uneListeDActions } from 'fixtures/action'
import { dateFuture, dateFutureLoin, datePasseeLoin, now } from 'fixtures/date'
import {
  desConseillersJeune,
  unConseillerHistorique,
  unDetailJeune,
  uneRechercheSauvegardee,
} from 'fixtures/jeune'
import {
  desRdvListItems,
  uneListeDeRdv,
  unRendezVous,
} from 'fixtures/rendez-vous'
import {
  mockedActionsService,
  mockedJeunesService,
  mockedRendezVousService,
} from 'fixtures/services'
import { StatutAction } from 'interfaces/action'
import { StructureConseiller } from 'interfaces/conseiller'
import {
  CategorieSituation,
  ConseillerHistorique,
  EtatSituation,
} from 'interfaces/jeune'
import { rdvToListItem } from 'interfaces/rdv'
import FicheJeune, {
  getServerSideProps,
  Onglet,
} from 'pages/mes-jeunes/[jeune_id]'
import { ActionsService } from 'services/actions.service'
import { JeunesService } from 'services/jeunes.service'
import { RendezVousService } from 'services/rendez-vous.service'
import renderPage from 'tests/renderPage'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { Dependencies } from 'utils/injectionDependances/container'
import withDependance from 'utils/injectionDependances/withDependance'

jest.mock('utils/auth/withMandatorySessionOrRedirect')
jest.mock('utils/injectionDependances/withDependance')
jest.mock('components/Modal')

describe('Fiche Jeune', () => {
  describe('client side', () => {
    const jeune = unDetailJeune()
    const rdvs = desRdvListItems()
    const actions = uneListeDActions()
    const listeConseillers = desConseillersJeune()
    const recherchesSauvegardees = uneRechercheSauvegardee()
    let motifsSuppression: string[]
    let dependances: Pick<Dependencies, 'jeunesService'>

    let replace: jest.Mock
    let push: jest.Mock
    beforeEach(async () => {
      replace = jest.fn(() => Promise.resolve())
      push = jest.fn()
      ;(useRouter as jest.Mock).mockReturnValue({
        replace: replace,
        push: push,
      })

      motifsSuppression = [
        'Sortie positive du CEJ',
        'Radiation du CEJ',
        'Recréation d’un compte jeune',
        'Autre',
      ]

      dependances = {
        jeunesService: mockedJeunesService({
          getMotifsSuppression: jest.fn(async () => motifsSuppression),
        }),
      }
    })

    describe('pour tous les conseillers', () => {
      let setIdJeune: (id: string | undefined) => void

      describe('render', () => {
        beforeEach(async () => {
          // Given
          setIdJeune = jest.fn()

          // When
          renderPage(
            <FicheJeune
              jeune={jeune}
              rdvs={[]}
              actionsInitiales={{
                actions: [],
                page: 1,
                metadonnees: { nombreTotal: 0, nombrePages: 0 },
              }}
              conseillers={listeConseillers}
              pageTitle={''}
              recherchesSauvegardees={recherchesSauvegardees}
            />,
            { idJeuneSetter: setIdJeune, customDependances: dependances }
          )
        })

        it('affiche la liste des 5 premiers conseillers du jeune', () => {
          // Then
          listeConseillers
            .slice(0, 5)
            .forEach(({ nom, prenom }: ConseillerHistorique) => {
              expect(screen.getByText(`${nom} ${prenom}`)).toBeInTheDocument()
            })
          expect(() => screen.getByText(listeConseillers[5].nom)).toThrow()
        })

        it('affiche un bouton pour dérouler la liste complète des conseillers du jeune', async () => {
          // Then
          const button = screen.getByRole('button', {
            name: 'Voir l’historique complet',
          })
          expect(listeConseillers.length).toEqual(6)
          expect(button).toBeInTheDocument()
        })

        it('permet d’afficher la liste complète des conseillers du jeune', async () => {
          // Given
          const button = screen.getByRole('button', {
            name: 'Voir l’historique complet',
          })

          // When
          await userEvent.click(button)

          //Then
          listeConseillers.forEach(({ nom, prenom }: ConseillerHistorique) => {
            expect(screen.getByText(`${nom} ${prenom}`)).toBeInTheDocument()
          })
        })

        it('modifie le currentJeune', () => {
          // Then
          expect(setIdJeune).toHaveBeenCalledWith(jeune.id)
        })

        it('affiche un bouton pour supprimer le compte d’un bénéficiaire', async () => {
          // Then
          const deleteButton = screen.getByText('Supprimer ce compte')
          expect(deleteButton).toBeInTheDocument()
        })
        it('affiche les informations des favoris du jeune', () => {
          // Then
          expect(screen.getByText('Favoris')).toBeInTheDocument()
        })
      })

      describe('Supprimer un compte actif', () => {
        beforeEach(async () => {
          // Given
          renderPage(
            <FicheJeune
              jeune={unDetailJeune({ isActivated: true })}
              rdvs={[]}
              actionsInitiales={{
                actions: [],
                page: 1,
                metadonnees: { nombreTotal: 0, nombrePages: 0 },
              }}
              conseillers={listeConseillers}
              pageTitle={''}
              recherchesSauvegardees={recherchesSauvegardees}
            />,
            { customDependances: dependances }
          )
          // Given
          const deleteButton = screen.getByText('Supprimer ce compte')

          // When
          await userEvent.click(deleteButton)
        })

        it('affiche la première modale de suppression du compte d’un bénéficiaire actif', async () => {
          // Then
          expect(
            screen.getByText('Souhaitez-vous continuer la suppression ?')
          ).toBeInTheDocument()
        })

        describe('Seconde étape suppression modale', () => {
          beforeEach(async () => {
            // Given
            const continuerButton = screen.getByText('Continuer')

            // When
            await userEvent.click(continuerButton)
          })

          it('affiche la seconde modale pour confirmer la suppression du compte d’un bénéficiaire actif', async () => {
            // Then
            expect(
              screen.getByText(
                /Une fois confirmé toutes les informations liées/
              )
            ).toBeInTheDocument()
          })

          it('contient un champ de sélection d’un motif', async () => {
            const selectMotif = screen.getByRole('combobox', {
              name: /Motif de suppression/,
            })

            // Then
            expect(selectMotif).toHaveAttribute('required', '')

            const options: HTMLOptionElement[] =
              within(selectMotif).getAllByRole('option')
            expect(options.map((option) => option.value)).toEqual(
              motifsSuppression
            )
          })

          it('affiche le champ de saisie pour préciser le motif Autre', async () => {
            // Given
            const selectMotif = screen.getByRole('combobox', {
              name: /Motif de suppression/,
            })

            // When
            await userEvent.selectOptions(selectMotif, 'Autre')

            // Then
            expect(
              screen.getByText(
                /Veuillez préciser le motif de la suppression du compte/
              )
            ).toBeInTheDocument()
          })

          it('lors de la confirmation, supprime le bénéficiaire', async () => {
            // Given
            const selectMotif = screen.getByRole('combobox', {
              name: /Motif de suppression/,
            })
            const supprimerButtonModal = screen.getByText('Confirmer')
            await userEvent.selectOptions(selectMotif, 'Radiation du CEJ')

            // When
            await userEvent.click(supprimerButtonModal)

            // Then
            expect(
              dependances.jeunesService.archiverJeune
            ).toHaveBeenCalledWith(jeune.id, {
              motif: 'Radiation du CEJ',
              commentaire: undefined,
            })
            expect(push).toHaveBeenCalledWith('/mes-jeunes?suppression=succes')
          })
        })
      })

      describe('Supprimer un compte inactif', () => {
        beforeEach(async () => {
          // Given
          renderPage(
            <FicheJeune
              jeune={unDetailJeune({ isActivated: false })}
              rdvs={[]}
              actionsInitiales={{
                actions: [],
                page: 1,
                metadonnees: { nombreTotal: 0, nombrePages: 0 },
              }}
              conseillers={listeConseillers}
              pageTitle={''}
              recherchesSauvegardees={recherchesSauvegardees}
            />,
            { customDependances: dependances }
          )
          // Given
          const deleteButton = screen.getByText('Supprimer ce compte')

          // When
          await userEvent.click(deleteButton)
        })

        it("affiche l'information", () => {
          // Then
          expect(
            screen.getByText('pas encore connecté', { exact: false })
          ).toBeInTheDocument()
        })

        it('affiche la modale de suppression du compte d’un bénéficiaire inactif', async () => {
          // Then
          expect(
            screen.getByText(/toutes les informations liées à ce compte/)
          ).toBeInTheDocument()
        })

        it('lors de la confirmation, supprime le bénéficiaire', async () => {
          // Given
          const supprimerButtonModal = screen.getByText('Confirmer')

          // When
          await userEvent.click(supprimerButtonModal)

          // Then
          expect(
            dependances.jeunesService.supprimerJeuneInactif
          ).toHaveBeenCalledWith(jeune.id)
          expect(push).toHaveBeenCalledWith('/mes-jeunes?suppression=succes')
        })
      })
    })

    describe("quand l'utilisateur n'est pas un conseiller Pole emploi", () => {
      let setIdJeune: (id: string | undefined) => void
      beforeEach(async () => {
        // Given
        setIdJeune = jest.fn()

        // When
        renderPage(
          <FicheJeune
            jeune={jeune}
            rdvs={rdvs}
            actionsInitiales={{
              actions,
              page: 1,
              metadonnees: { nombreTotal: 14, nombrePages: 2 },
            }}
            conseillers={listeConseillers}
            pageTitle={''}
            recherchesSauvegardees={recherchesSauvegardees}
          />,
          { idJeuneSetter: setIdJeune }
        )
      })

      it('affiche la liste des rendez-vous du jeune', async () => {
        // Then
        expect(
          screen.getByRole('tab', { selected: true })
        ).toHaveAccessibleName('Rendez-vous 2')
        rdvs.forEach((rdv) => {
          expect(screen.getByText(rdv.type)).toBeInTheDocument()
          expect(screen.getByText(rdv.modality)).toBeInTheDocument()
        })
        expect(() =>
          screen.getByRole('table', { name: /Liste des actions de/ })
        ).toThrow()
      })

      it('affiche les actions du jeune', async () => {
        // When
        const tabActions = screen.getByRole('tab', { name: 'Actions 14' })
        await userEvent.click(tabActions)

        // Then
        actions.forEach((action) => {
          expect(screen.getByText(action.content)).toBeInTheDocument()
        })
        expect(
          screen.getByRole('tab', { selected: true })
        ).toHaveAccessibleName('Actions 14')
        expect(() =>
          screen.getByRole('table', { name: 'Liste de mes rendez-vous' })
        ).toThrow()
        expect(replace).toHaveBeenCalledWith(
          { pathname: '/mes-jeunes/jeune-1', query: { onglet: 'actions' } },
          undefined,
          { shallow: true }
        )
      })

      it('permet la prise de rendez-vous', async () => {
        // Then
        expect(
          screen.getByRole('link', { name: 'Fixer un rendez-vous' })
        ).toHaveAttribute('href', '/mes-jeunes/edition-rdv')
      })

      it('permet la création d’une action', async () => {
        // Then
        expect(
          screen.getByRole('link', { name: 'Créer une nouvelle action' })
        ).toHaveAttribute('href', '/mes-jeunes/jeune-1/actions/nouvelle-action')
      })
    })

    describe('quand il y a moins de 5 conseillers dans l’historique', () => {
      it('n’affiche pas de bouton pour dérouler', async () => {
        const conseillers = [unConseillerHistorique()]
        // Given
        renderPage(
          <FicheJeune
            jeune={jeune}
            rdvs={rdvs}
            actionsInitiales={{
              actions,
              page: 1,
              metadonnees: { nombreTotal: 14, nombrePages: 2 },
            }}
            conseillers={conseillers}
            pageTitle={''}
            recherchesSauvegardees={recherchesSauvegardees}
          />
        )

        // Then
        expect(conseillers.length).toEqual(1)
        expect(() => screen.getByText('Voir l’historique complet')).toThrow()
      })
    })

    describe("quand l'utilisateur est un conseiller Pole emploi", () => {
      beforeEach(async () => {
        // When
        renderPage(
          <FicheJeune
            jeune={jeune}
            rdvs={[]}
            actionsInitiales={{
              actions,
              page: 1,
              metadonnees: { nombreTotal: 14, nombrePages: 2 },
            }}
            conseillers={[]}
            pageTitle={''}
            recherchesSauvegardees={recherchesSauvegardees}
          />,
          {
            customConseiller: { structure: StructureConseiller.POLE_EMPLOI },
          }
        )
      })

      it("n'affiche pas la liste des rendez-vous du jeune", async () => {
        // Then
        expect(
          screen.getByText(
            'Gérez les convocations de ce jeune depuis vos outils Pôle emploi.'
          )
        ).toBeInTheDocument()
      })

      it('ne permet pas la prise de rendez-vous', async () => {
        // Then
        expect(() => screen.getByText('Fixer un rendez-vous')).toThrow()
      })

      it("n'affiche pas de lien vers les actions du jeune", async () => {
        // Given
        await userEvent.click(screen.getByRole('tab', { name: /Actions/ }))

        // Then
        expect(() =>
          screen.getByRole('link', {
            name: 'Voir la liste des actions du jeune',
          })
        ).toThrow()
        expect(
          screen.getByText(
            'Gérez les actions et démarches de ce jeune depuis vos outils Pôle emploi.'
          )
        ).toBeInTheDocument()
      })

      it('ne permet pas la création d’action', async () => {
        // Then
        expect(() => screen.getByText('Créer une nouvelle action')).toThrow()
      })
    })

    describe('quand l’utilisateur est un conseiller MILO', () => {
      describe('quand le jeune n’a aucune situation', () => {
        it('affiche les informations concernant la situation du jeune', () => {
          // Given
          renderPage(
            <FicheJeune
              jeune={jeune}
              rdvs={[]}
              actionsInitiales={{
                actions,
                page: 1,
                metadonnees: { nombreTotal: 14, nombrePages: 2 },
              }}
              conseillers={[]}
              pageTitle={''}
              recherchesSauvegardees={recherchesSauvegardees}
            />,
            { customConseiller: { structure: StructureConseiller.MILO } }
          )

          // Then
          expect(screen.getByText('Situation')).toBeInTheDocument()
          expect(screen.getByText('Sans situation')).toBeInTheDocument()
        })
      })

      describe('quand le jeune a une liste de situations', () => {
        it('affiche les informations concernant la situation du jeune ', () => {
          // Given
          const situations = [
            {
              etat: EtatSituation.EN_COURS,
              categorie: CategorieSituation.EMPLOI,
            },
            {
              etat: EtatSituation.PREVU,
              categorie: CategorieSituation.CONTRAT_EN_ALTERNANCE,
            },
          ]
          renderPage(
            <FicheJeune
              jeune={unDetailJeune({ situations: situations })}
              rdvs={[]}
              actionsInitiales={{
                actions,
                page: 1,
                metadonnees: { nombreTotal: 14, nombrePages: 2 },
              }}
              conseillers={[]}
              pageTitle={''}
              recherchesSauvegardees={recherchesSauvegardees}
            />,
            { customConseiller: { structure: StructureConseiller.MILO } }
          )

          // Then
          expect(screen.getByText('Situation')).toBeInTheDocument()
          expect(screen.getByText('Emploi')).toBeInTheDocument()
          expect(screen.getByText('en cours')).toBeInTheDocument()
          expect(screen.getByText('Contrat en Alternance')).toBeInTheDocument()
        })
      })
    })

    describe("quand le jeune n'a pas d'action", () => {
      it('affiche un message qui le précise', async () => {
        // Given
        renderPage(
          <FicheJeune
            jeune={jeune}
            rdvs={rdvs}
            actionsInitiales={{
              actions: [],
              page: 1,
              metadonnees: { nombreTotal: 0, nombrePages: 0 },
            }}
            conseillers={[]}
            pageTitle={''}
            recherchesSauvegardees={recherchesSauvegardees}
          />
        )

        // When
        await userEvent.click(screen.getByRole('tab', { name: /Actions/ }))

        // Then
        expect(screen.getByText(/n’a pas encore d’action/)).toBeInTheDocument()
      })
    })

    describe('quand le jeune a été réaffecté temporairement', () => {
      it("affiche l'information", () => {
        // Given
        renderPage(
          <FicheJeune
            jeune={{ ...jeune, isReaffectationTemporaire: true }}
            rdvs={rdvs}
            actionsInitiales={{
              actions: [],
              page: 1,
              metadonnees: { nombreTotal: 0, nombrePages: 0 },
            }}
            conseillers={[]}
            pageTitle={''}
            recherchesSauvegardees={recherchesSauvegardees}
          />
        )

        // Then
        expect(screen.getByText(/ajouté temporairement/)).toBeInTheDocument()
      })
    })

    describe('quand on revient sur la page depuis le détail d’une action', () => {
      it('ouvre l’onglet des actions', () => {
        // Given
        renderPage(
          <FicheJeune
            jeune={jeune}
            rdvs={[]}
            actionsInitiales={{
              actions,
              page: 1,
              metadonnees: { nombreTotal: 14, nombrePages: 2 },
            }}
            conseillers={[]}
            pageTitle={''}
            onglet={Onglet.ACTIONS}
            recherchesSauvegardees={recherchesSauvegardees}
          />
        )

        // Then
        expect(
          screen.getByRole('tab', { selected: true })
        ).toHaveAccessibleName('Actions 14')
      })
    })

    describe('pagination actions', () => {
      describe('navigation', () => {
        let actionsService: ActionsService
        let pageCourante: number
        beforeEach(() => {
          // Given
          actionsService = mockedActionsService({
            getActionsJeuneClientSide: jest.fn(async (_, { page }) => ({
              actions: [uneAction({ content: `Action page ${page}` })],
              metadonnees: { nombreTotal: 52, nombrePages: 6 },
            })),
          })

          pageCourante = 4
          renderPage(
            <FicheJeune
              jeune={jeune}
              rdvs={rdvs}
              actionsInitiales={{
                actions,
                page: pageCourante,
                metadonnees: { nombreTotal: 52, nombrePages: 6 },
              }}
              conseillers={listeConseillers}
              pageTitle={''}
              onglet={Onglet.ACTIONS}
              recherchesSauvegardees={recherchesSauvegardees}
            />,
            { customDependances: { actionsService } }
          )
        })

        it('met à jour les actions avec la page demandée ', async () => {
          // When
          await userEvent.click(screen.getByLabelText('Page 2'))

          // Then
          expect(actionsService.getActionsJeuneClientSide).toHaveBeenCalledWith(
            jeune.id,
            { page: 2, statuts: [], tri: 'date_echeance_decroissante' }
          )
          expect(screen.getByLabelText('Page 2')).toHaveAttribute(
            'aria-current',
            'page'
          )
          expect(screen.getByText('Action page 2')).toBeInTheDocument()
        })

        it('permet d’aller à la première page des actions', async () => {
          // When
          await userEvent.click(screen.getByLabelText('Première page'))

          // Then
          expect(actionsService.getActionsJeuneClientSide).toHaveBeenCalledWith(
            jeune.id,
            { page: 1, statuts: [], tri: 'date_echeance_decroissante' }
          )
          expect(screen.getByLabelText('Page 1')).toHaveAttribute(
            'aria-current',
            'page'
          )
          expect(screen.getByLabelText('Première page')).toHaveAttribute(
            'disabled'
          )
        })

        it('permet d’aller à la dernière page des actions', async () => {
          // When
          await userEvent.click(screen.getByLabelText('Dernière page'))

          // Then
          expect(actionsService.getActionsJeuneClientSide).toHaveBeenCalledWith(
            jeune.id,
            { page: 6, statuts: [], tri: 'date_echeance_decroissante' }
          )
          expect(screen.getByLabelText('Page 6')).toHaveAttribute(
            'aria-current',
            'page'
          )
          expect(screen.getByLabelText('Dernière page')).toHaveAttribute(
            'disabled'
          )
        })

        it('permet de revenir à la page précédente', async () => {
          // When
          await userEvent.click(screen.getByLabelText('Page précédente'))

          // Then
          expect(actionsService.getActionsJeuneClientSide).toHaveBeenCalledWith(
            jeune.id,
            {
              page: pageCourante - 1,
              statuts: [],
              tri: 'date_echeance_decroissante',
            }
          )
          expect(
            screen.getByLabelText(`Page ${pageCourante - 1}`)
          ).toHaveAttribute('aria-current', 'page')
        })

        it("permet d'aller à la page suivante", async () => {
          // When
          await userEvent.click(screen.getByLabelText('Page suivante'))

          // Then
          expect(actionsService.getActionsJeuneClientSide).toHaveBeenCalledWith(
            jeune.id,
            {
              page: pageCourante + 1,
              statuts: [],
              tri: 'date_echeance_decroissante',
            }
          )
          expect(
            screen.getByLabelText(`Page ${pageCourante + 1}`)
          ).toHaveAttribute('aria-current', 'page')
        })

        it('met à jour la page courante', async () => {
          // When
          await userEvent.click(screen.getByLabelText('Page précédente'))
          await userEvent.click(screen.getByLabelText('Page précédente'))

          // Then
          expect(actionsService.getActionsJeuneClientSide).toHaveBeenCalledWith(
            jeune.id,
            {
              page: pageCourante - 1,
              statuts: [],
              tri: 'date_echeance_decroissante',
            }
          )

          expect(actionsService.getActionsJeuneClientSide).toHaveBeenCalledWith(
            jeune.id,
            {
              page: pageCourante - 2,
              statuts: [],
              tri: 'date_echeance_decroissante',
            }
          )
          expect(
            screen.getByLabelText(`Page ${pageCourante - 2}`)
          ).toHaveAttribute('aria-current', 'page')
        })

        it('ne permet pas de revenir avant la première page', async () => {
          // Given
          await userEvent.click(screen.getByLabelText('Première page'))

          // When
          await userEvent.click(screen.getByLabelText('Page précédente'))

          // Then
          expect(
            actionsService.getActionsJeuneClientSide
          ).toHaveBeenCalledTimes(1)
          expect(screen.getByLabelText('Page 1')).toHaveAttribute(
            'aria-current',
            'page'
          )
          expect(screen.getByLabelText('Page précédente')).toHaveAttribute(
            'disabled'
          )
        })

        it("ne permet pas d'aller après la dernière page", async () => {
          // Given
          await userEvent.click(screen.getByLabelText('Dernière page'))

          // When
          await userEvent.click(screen.getByLabelText('Page suivante'))

          // Then
          expect(
            actionsService.getActionsJeuneClientSide
          ).toHaveBeenCalledTimes(1)
          expect(screen.getByLabelText('Page 6')).toHaveAttribute(
            'aria-current',
            'page'
          )
          expect(screen.getByLabelText('Page suivante')).toHaveAttribute(
            'disabled'
          )
        })

        it('ne recharge pas la page courante', async () => {
          // When
          await userEvent.click(screen.getByLabelText(`Page ${pageCourante}`))

          // Then
          expect(
            actionsService.getActionsJeuneClientSide
          ).toHaveBeenCalledTimes(0)
        })
      })

      describe('troncature', () => {
        it('1 2 -3-', () => {
          // When
          renderPage(
            <FicheJeune
              jeune={jeune}
              rdvs={[]}
              actionsInitiales={{
                actions: [],
                page: 3,
                metadonnees: { nombreTotal: 22, nombrePages: 3 },
              }}
              conseillers={[]}
              pageTitle={''}
              onglet={Onglet.ACTIONS}
              recherchesSauvegardees={recherchesSauvegardees}
            />
          )

          // Then
          expect(screen.getAllByLabelText(/Page \d+/)).toHaveLength(3)
          expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 2')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 3')).toBeInTheDocument()
          expect(() => screen.getByText('…')).toThrow()
        })

        it('1 2 -3- 4 5 6', () => {
          // When
          renderPage(
            <FicheJeune
              jeune={jeune}
              rdvs={[]}
              actionsInitiales={{
                actions: [],
                page: 3,
                metadonnees: { nombreTotal: 52, nombrePages: 6 },
              }}
              conseillers={[]}
              pageTitle={''}
              onglet={Onglet.ACTIONS}
              recherchesSauvegardees={recherchesSauvegardees}
            />
          )

          // Then
          expect(screen.getAllByLabelText(/Page \d+/)).toHaveLength(6)
          expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 2')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 3')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 4')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 5')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 6')).toBeInTheDocument()
          expect(() => screen.getByText('…')).toThrow()
        })

        it('-1- 2 3 4 5 ... 20', () => {
          // When
          renderPage(
            <FicheJeune
              jeune={jeune}
              rdvs={[]}
              actionsInitiales={{
                actions: [],
                page: 1,
                metadonnees: { nombreTotal: 195, nombrePages: 20 },
              }}
              conseillers={[]}
              pageTitle={''}
              onglet={Onglet.ACTIONS}
              recherchesSauvegardees={recherchesSauvegardees}
            />
          )

          // Then
          expect(screen.getAllByLabelText(/Page \d+/)).toHaveLength(6)
          expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 2')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 3')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 4')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 5')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 20')).toBeInTheDocument()
          expect(screen.getAllByText('…')).toHaveLength(1)
        })

        it('1 ... 9 10 -11- 12 13 ... 20', () => {
          // When
          renderPage(
            <FicheJeune
              jeune={jeune}
              rdvs={[]}
              actionsInitiales={{
                actions: [],
                page: 11,
                metadonnees: { nombreTotal: 195, nombrePages: 20 },
              }}
              conseillers={[]}
              pageTitle={''}
              onglet={Onglet.ACTIONS}
              recherchesSauvegardees={recherchesSauvegardees}
            />
          )

          // Then
          expect(screen.getAllByLabelText(/Page \d+/)).toHaveLength(7)
          expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 9')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 10')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 11')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 12')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 13')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 20')).toBeInTheDocument()
          expect(screen.getAllByText('…')).toHaveLength(2)
        })

        it('1 2 3 -4- 5 6 ... 20', () => {
          // When
          renderPage(
            <FicheJeune
              jeune={jeune}
              rdvs={[]}
              actionsInitiales={{
                actions: [],
                page: 4,
                metadonnees: { nombreTotal: 195, nombrePages: 20 },
              }}
              conseillers={[]}
              pageTitle={''}
              onglet={Onglet.ACTIONS}
              recherchesSauvegardees={recherchesSauvegardees}
            />
          )

          // Then
          expect(screen.getAllByLabelText(/Page \d+/)).toHaveLength(7)
          expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 2')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 3')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 4')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 5')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 6')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 20')).toBeInTheDocument()
          expect(screen.getAllByText('…')).toHaveLength(1)
        })

        it('1 ... 15 16 -17- 18 19 20', () => {
          // When
          renderPage(
            <FicheJeune
              jeune={jeune}
              rdvs={[]}
              actionsInitiales={{
                actions: [],
                page: 17,
                metadonnees: { nombreTotal: 195, nombrePages: 20 },
              }}
              conseillers={[]}
              pageTitle={''}
              onglet={Onglet.ACTIONS}
              recherchesSauvegardees={recherchesSauvegardees}
            />
          )

          // Then
          expect(screen.getAllByLabelText(/Page \d+/)).toHaveLength(7)
          expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 15')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 16')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 17')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 18')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 19')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 20')).toBeInTheDocument()
          expect(screen.getAllByText('…')).toHaveLength(1)
        })

        it('1 ... 16 17 -18- 19 20', () => {
          // When
          renderPage(
            <FicheJeune
              jeune={jeune}
              rdvs={[]}
              actionsInitiales={{
                actions: [],
                page: 18,
                metadonnees: { nombreTotal: 195, nombrePages: 20 },
              }}
              conseillers={[]}
              pageTitle={''}
              onglet={Onglet.ACTIONS}
              recherchesSauvegardees={recherchesSauvegardees}
            />
          )

          // Then
          expect(screen.getAllByLabelText(/Page \d+/)).toHaveLength(6)
          expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 16')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 17')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 18')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 19')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 20')).toBeInTheDocument()
          expect(screen.getAllByText('…')).toHaveLength(1)
        })

        it('1 ... 16 17 18 19 -20-', () => {
          // When
          renderPage(
            <FicheJeune
              jeune={jeune}
              rdvs={[]}
              actionsInitiales={{
                actions: [],
                page: 20,
                metadonnees: { nombreTotal: 195, nombrePages: 20 },
              }}
              conseillers={[]}
              pageTitle={''}
              onglet={Onglet.ACTIONS}
              recherchesSauvegardees={recherchesSauvegardees}
            />
          )

          // Then
          expect(screen.getAllByLabelText(/Page \d+/)).toHaveLength(6)
          expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 16')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 17')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 18')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 19')).toBeInTheDocument()
          expect(screen.getByLabelText('Page 20')).toBeInTheDocument()
          expect(screen.getAllByText('…')).toHaveLength(1)
        })
      })
    })

    describe('filtrer les actions par status', () => {
      let actionsService: ActionsService
      let pageCourante: number
      beforeEach(async () => {
        // Given
        actionsService = mockedActionsService({
          getActionsJeuneClientSide: jest.fn(async () => ({
            actions: [uneAction({ content: 'Action filtrée' })],
            metadonnees: { nombreTotal: 52, nombrePages: 3 },
          })),
        })

        pageCourante = 1
        renderPage(
          <FicheJeune
            jeune={jeune}
            rdvs={rdvs}
            actionsInitiales={{
              actions,
              page: pageCourante,
              metadonnees: { nombreTotal: 52, nombrePages: 6 },
            }}
            conseillers={listeConseillers}
            pageTitle={''}
            onglet={Onglet.ACTIONS}
            recherchesSauvegardees={recherchesSauvegardees}
          />,
          { customDependances: { actionsService } }
        )

        // When
        await userEvent.click(screen.getByText('Statut'))
        await userEvent.click(screen.getByLabelText('Commencée'))
        await userEvent.click(screen.getByLabelText('À réaliser'))
        await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
      })

      it('filtre les actions', () => {
        // Then
        expect(actionsService.getActionsJeuneClientSide).toHaveBeenCalledWith(
          jeune.id,
          {
            page: 1,
            statuts: [StatutAction.Commencee, StatutAction.ARealiser],
            tri: 'date_echeance_decroissante',
          }
        )
        expect(screen.getByText('Action filtrée')).toBeInTheDocument()
      })

      it('met à jour la pagination', () => {
        expect(screen.getAllByLabelText(/Page \d+/)).toHaveLength(3)
        expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
        expect(screen.getByLabelText('Page 2')).toBeInTheDocument()
        expect(screen.getByLabelText('Page 3')).toBeInTheDocument()
      })

      it('conserve les filtres de statut en changeant de page', async () => {
        // When
        await userEvent.click(screen.getByLabelText('Page 2'))

        // Then
        expect(actionsService.getActionsJeuneClientSide).toHaveBeenCalledWith(
          jeune.id,
          {
            page: 2,
            statuts: [StatutAction.Commencee, StatutAction.ARealiser],
            tri: 'date_echeance_decroissante',
          }
        )
      })
    })

    describe('trier les actions par date de création', () => {
      let actionsService: ActionsService
      let pageCourante: number
      let headerColonneDate: HTMLButtonElement
      beforeEach(async () => {
        // Given
        actionsService = mockedActionsService({
          getActionsJeuneClientSide: jest.fn(async () => ({
            actions: [uneAction({ content: 'Action triée' })],
            metadonnees: { nombreTotal: 52, nombrePages: 3 },
          })),
        })

        pageCourante = 1
        renderPage(
          <FicheJeune
            jeune={jeune}
            rdvs={rdvs}
            actionsInitiales={{
              actions,
              page: pageCourante,
              metadonnees: { nombreTotal: 52, nombrePages: 6 },
            }}
            conseillers={listeConseillers}
            pageTitle={''}
            onglet={Onglet.ACTIONS}
          />,
          { customDependances: { actionsService } }
        )

        headerColonneDate = screen.getByRole('button', { name: /Créée le/ })
      })

      it('tri les actions par ordre croissant puis decroissant', async () => {
        // When
        await userEvent.click(headerColonneDate)
        await userEvent.click(headerColonneDate)

        // Then
        expect(actionsService.getActionsJeuneClientSide).toHaveBeenCalledWith(
          jeune.id,
          {
            page: 1,
            statuts: [],
            tri: 'date_croissante',
          }
        )
        expect(actionsService.getActionsJeuneClientSide).toHaveBeenCalledWith(
          jeune.id,
          {
            page: 1,
            statuts: [],
            tri: 'date_decroissante',
          }
        )
        expect(screen.getByText('Action triée')).toBeInTheDocument()
      })

      it('met à jour la pagination', async () => {
        // When
        await userEvent.click(headerColonneDate)

        // Then
        expect(screen.getAllByLabelText(/Page \d+/)).toHaveLength(3)
        expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
        expect(screen.getByLabelText('Page 2')).toBeInTheDocument()
        expect(screen.getByLabelText('Page 3')).toBeInTheDocument()
      })

      it('conserve le tri en changeant de page', async () => {
        // When
        await userEvent.click(headerColonneDate)
        await userEvent.click(screen.getByLabelText('Page 2'))

        // Then
        expect(actionsService.getActionsJeuneClientSide).toHaveBeenCalledWith(
          jeune.id,
          {
            page: 2,
            statuts: [],
            tri: 'date_decroissante',
          }
        )
      })
    })

    describe("trier les actions par date d'échéance", () => {
      let actionsService: ActionsService
      let pageCourante: number
      let headerColonneDate: HTMLButtonElement
      beforeEach(async () => {
        // Given
        actionsService = mockedActionsService({
          getActionsJeuneClientSide: jest.fn(async () => ({
            actions: [uneAction({ content: 'Action triée' })],
            metadonnees: { nombreTotal: 52, nombrePages: 3 },
          })),
        })

        pageCourante = 1
        renderPage(
          <FicheJeune
            jeune={jeune}
            rdvs={rdvs}
            actionsInitiales={{
              actions,
              page: pageCourante,
              metadonnees: { nombreTotal: 52, nombrePages: 6 },
            }}
            conseillers={listeConseillers}
            pageTitle={''}
            onglet={Onglet.ACTIONS}
            recherchesSauvegardees={recherchesSauvegardees}
          />,
          { customDependances: { actionsService } }
        )

        headerColonneDate = screen.getByRole('button', { name: /Échéance/ })
      })

      it('tri les actions par ordre croissant puis decroissant', async () => {
        // When
        await userEvent.click(headerColonneDate)
        await userEvent.click(headerColonneDate)

        // Then
        expect(actionsService.getActionsJeuneClientSide).toHaveBeenCalledWith(
          jeune.id,
          {
            page: 1,
            statuts: [],
            tri: 'date_echeance_croissante',
          }
        )
        expect(actionsService.getActionsJeuneClientSide).toHaveBeenCalledWith(
          jeune.id,
          {
            page: 1,
            statuts: [],
            tri: 'date_echeance_decroissante',
          }
        )
        expect(screen.getByText('Action triée')).toBeInTheDocument()
      })

      it('met à jour la pagination', async () => {
        // When
        await userEvent.click(headerColonneDate)

        // Then
        expect(screen.getAllByLabelText(/Page \d+/)).toHaveLength(3)
        expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
        expect(screen.getByLabelText('Page 2')).toBeInTheDocument()
        expect(screen.getByLabelText('Page 3')).toBeInTheDocument()
      })

      it('conserve le tri en changeant de page', async () => {
        // When
        await userEvent.click(headerColonneDate)
        await userEvent.click(screen.getByLabelText('Page 2'))

        // Then
        expect(actionsService.getActionsJeuneClientSide).toHaveBeenCalledWith(
          jeune.id,
          {
            page: 2,
            statuts: [],
            tri: 'date_echeance_croissante',
          }
        )
      })
    })
  })

  describe('server side', () => {
    const rdvAVenir = unRendezVous({
      date: DateTime.now().plus({ day: 1 }).toISO(),
    })
    let jeunesService: JeunesService
    let rendezVousService: RendezVousService
    let actionsService: ActionsService
    beforeEach(() => {
      jeunesService = mockedJeunesService({
        getJeuneDetails: jest.fn(async () => unDetailJeune()),
        getConseillersDuJeuneServerSide: jest.fn(async () =>
          desConseillersJeune()
        ),
        getJeuneRecherchesSauvegardees: jest.fn(async () =>
          uneRechercheSauvegardee()
        ),
      })
      rendezVousService = mockedRendezVousService({
        getRendezVousJeune: jest.fn(async () =>
          uneListeDeRdv().concat(rdvAVenir)
        ),
      })
      actionsService = mockedActionsService({
        getActionsJeuneServerSide: jest.fn(async () => ({
          actions: [
            uneAction({ creationDate: now.toISOString() }),
            uneAction({ creationDate: datePasseeLoin.toISOString() }),
            uneAction({ creationDate: dateFuture.toISOString() }),
            uneAction({ creationDate: dateFutureLoin.toISOString() }),
          ],
          metadonnees: { nombreTotal: 14, nombrePages: 2 },
        })),
      })
      ;(withDependance as jest.Mock).mockImplementation((dependance) => {
        if (dependance === 'jeunesService') return jeunesService
        if (dependance === 'rendezVousService') return rendezVousService
        if (dependance === 'actionsService') return actionsService
      })
    })

    describe('Quand la session est invalide', () => {
      it('redirige', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockReturnValue({
          redirect: 'whatever',
          validSession: false,
        })

        // When
        const actual = await getServerSideProps({} as GetServerSidePropsContext)

        // Then
        expect(actual).toEqual({ redirect: 'whatever' })
      })
    })

    describe('Quand la session est valide', () => {
      let actual: GetServerSidePropsResult<any>
      beforeEach(async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockReturnValue({
          session: {
            accessToken: 'accessToken',
            user: { id: 'id-conseiller', structure: 'MILO' },
          },
          validSession: true,
        })

        // When
        actual = await getServerSideProps({
          query: { jeune_id: 'id-jeune' },
        } as unknown as GetServerSidePropsContext)
      })

      it('récupère les infos du jeune', async () => {
        // Then
        expect(jeunesService.getJeuneDetails).toHaveBeenCalledWith(
          'id-jeune',
          'accessToken'
        )
        expect(actual).toEqual({
          props: {
            jeune: unDetailJeune(),
            pageTitle: 'Mes jeunes - Kenji Jirac',
            pageHeader: 'Kenji Jirac',
            rdvs: expect.arrayContaining([]),
            actionsInitiales: expect.arrayContaining([]),
            conseillers: expect.arrayContaining([]),
            recherchesSauvegardees: expect.arrayContaining([]),
          },
        })
      })

      it('récupère les rendez-vous à venir du jeune', async () => {
        // Then
        expect(rendezVousService.getRendezVousJeune).toHaveBeenCalledWith(
          'id-jeune',
          'accessToken'
        )
        expect(actual).toMatchObject({
          props: { rdvs: [rdvToListItem(rdvAVenir)] },
        })
      })

      it('récupère les favoris', async () => {
        // Then
        expect(
          jeunesService.getJeuneRecherchesSauvegardees
        ).toHaveBeenCalledWith('id-conseiller', 'id-jeune', 'accessToken')
        expect(actual).toMatchObject({
          props: { recherchesSauvegardees: uneRechercheSauvegardee() },
        })
      })

      it('récupère la première page des actions du jeune', async () => {
        // Then
        expect(actionsService.getActionsJeuneServerSide).toHaveBeenCalledWith(
          'id-jeune',
          { page: 1, statuts: [] },
          'accessToken'
        )
        expect(actual).toMatchObject({
          props: {
            actionsInitiales: {
              actions: [
                uneAction({ creationDate: now.toISOString() }),
                uneAction({ creationDate: datePasseeLoin.toISOString() }),
                uneAction({ creationDate: dateFuture.toISOString() }),
                uneAction({ creationDate: dateFutureLoin.toISOString() }),
              ],
              page: 1,
              metadonnees: { nombreTotal: 14, nombrePages: 2 },
            },
          },
        })
      })

      it('récupère les conseillers du jeune', async () => {
        // Then
        expect(
          jeunesService.getConseillersDuJeuneServerSide
        ).toHaveBeenCalledWith('id-jeune', 'accessToken')
        expect(actual).toMatchObject({
          props: { conseillers: desConseillersJeune() },
        })
      })
    })

    describe('Quand on demande une page d’actions spécifique', () => {
      it('récupère la page demandée des actions du jeune', async () => {
        // When
        const actual = await getServerSideProps({
          query: { jeune_id: 'id-jeune', page: 3 },
        } as unknown as GetServerSidePropsContext)
        // Then
        expect(actionsService.getActionsJeuneServerSide).toHaveBeenCalledWith(
          'id-jeune',
          { page: 3, statuts: [] },
          'accessToken'
        )
        expect(actual).toMatchObject({
          props: {
            actionsInitiales: {
              page: 3,
            },
          },
        })
      })
    })

    describe('Quand on vient de créer un rendez-vous', () => {
      it('récupère le statut de la création', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockReturnValue({
          session: {
            accessToken: 'accessToken',
            user: { structure: 'MILO' },
          },
          validSession: true,
        })

        // When
        const actual = await getServerSideProps({
          query: { creationRdv: 'succes' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({ props: { rdvCreationSuccess: true } })
      })
    })

    describe('Quand on vient de modifier un rendez-vous', () => {
      it('récupère le statut de la modification', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockReturnValue({
          session: {
            accessToken: 'accessToken',
            user: { structure: 'MILO' },
          },
          validSession: true,
        })

        // When
        const actual = await getServerSideProps({
          query: { modificationRdv: 'succes' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({
          props: { rdvModificationSuccess: true },
        })
      })
    })

    describe("Quand on vient d'envoyer un message groupé", () => {
      it("récupère le statut de l'envoi", async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockReturnValue({
          session: {
            accessToken: 'accessToken',
            user: { structure: 'MILO' },
          },
          validSession: true,
        })

        // When
        const actual = await getServerSideProps({
          query: { envoiMessage: 'succes' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({
          props: { messageEnvoiGroupeSuccess: true },
        })
      })
    })

    describe('Quand on vient de créer une action', () => {
      it('récupère le statut de la création', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockReturnValue({
          session: {
            accessToken: 'accessToken',
            user: { structure: 'MILO' },
          },
          validSession: true,
        })

        // When
        const actual = await getServerSideProps({
          query: { creationAction: 'succes' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({
          props: { actionCreationSuccess: true },
        })
      })
    })

    describe('Quand on vient du détail d’une action', () => {
      it('récupère l’onglet sur lequel ouvrir la page', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockReturnValue({
          session: {
            accessToken: 'accessToken',
            user: { structure: 'MILO' },
          },
          validSession: true,
        })

        // When
        const actual = await getServerSideProps({
          query: { onglet: 'actions' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({ props: { onglet: Onglet.ACTIONS } })
      })
    })

    describe('Quand le conseiller est Pole emploi', () => {
      let actual: GetServerSidePropsResult<any>
      beforeEach(async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockReturnValue({
          session: { user: { structure: 'POLE_EMPLOI' } },
          validSession: true,
        })

        // When
        actual = await getServerSideProps({
          query: {},
        } as unknown as GetServerSidePropsContext)
      })

      it('ne recupère pas les rendez-vous', async () => {
        // Then
        expect(rendezVousService.getRendezVousJeune).not.toHaveBeenCalled()
        expect(actual).toMatchObject({ props: { rdvs: [] } })
      })

      it('ne recupère pas les actions', async () => {
        // Then
        expect(actionsService.getActionsJeuneServerSide).not.toHaveBeenCalled()
        expect(actual).toMatchObject({
          props: { actionsInitiales: { actions: [] } },
        })
      })
    })
  })
})

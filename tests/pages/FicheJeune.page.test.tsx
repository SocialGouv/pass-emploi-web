import { fireEvent, screen, within } from '@testing-library/react'
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
import { UserStructure } from 'interfaces/conseiller'
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

    let replace: jest.Mock
    beforeEach(async () => {
      replace = jest.fn(() => Promise.resolve())
      ;(useRouter as jest.Mock).mockReturnValue({ replace })
    })

    describe('pour tous les conseillers', () => {
      let setIdJeune: (id: string | undefined) => void
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
            conseillers={[]}
            pageTitle={''}
            motifsSuppression={[]}
          />,
          { idJeuneSetter: setIdJeune }
        )
      })

      it('affiche un bouton pour supprimer le compte d’un bénéficiaire', async () => {
        // Then
        const deleteButton = screen.getByText('Supprimer ce compte')
        expect(deleteButton).toBeInTheDocument()
      })

      describe('Supprimer un compte actif', () => {
        beforeEach(async () => {
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

        it('affiche la seconde modale pour confirmer la suppression du compte d’un bénéficiaire actif', async () => {
          // Given
          const continuerButton = screen.getByText('Continuer')

          // When
          await userEvent.click(continuerButton)

          // Then
          expect(
            screen.getByText(/Une fois confirmé toutes les informations liées/)
          ).toBeInTheDocument()
        })

        it('contient un champ de sélection d’un motif', async () => {
          // Given
          const continuerButton = screen.getByText('Continuer')
          await userEvent.click(continuerButton)

          const selectMotif = screen.getByRole('combobox', {
            name: 'Motif de suppression',
          })

          // Then
          userEvent.selectOptions(
            screen.getByLabelText('Motif de suppression'),
            'Radiation du CEJ'
          )

          expect(selectMotif).toBeInTheDocument()
          expect(selectMotif).toHaveAttribute('required', '')
        })

        it('lorsque le motif est AUTRE', async () => {
          // Given
          const continuerButton = screen.getByText('Continuer')
          await userEvent.click(continuerButton)
          const selectMotif = screen.getByRole('combobox', {
            name: 'Motif de suppression',
          })

          // When
          fireEvent.change(selectMotif, {
            target: { value: 'Autre' },
          })

          // Then
          expect(
            screen.getByText(
              'Veuillez préciser le motif de la suppression du compte'
            )
          ).toBeInTheDocument()
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
            motifsSuppression={[]}
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
            motifsSuppression={[]}
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
            motifsSuppression={[]}
          />,
          {
            customSession: {
              user: {
                id: 'idConseiller',
                name: 'Tavernier',
                email: 'fake@email.fr',
                structure: UserStructure.POLE_EMPLOI,
                estConseiller: true,
                estSuperviseur: false,
              },
            },
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
              motifsSuppression={[]}
            />,
            {
              customSession: {
                user: {
                  id: 'idConseiller',
                  name: 'Tavernier',
                  email: 'fake@email.fr',
                  structure: UserStructure.MILO,
                  estConseiller: true,
                  estSuperviseur: false,
                },
              },
            }
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
              motifsSuppression={[]}
            />,
            {
              customSession: {
                user: {
                  id: 'idConseiller',
                  name: 'Tavernier',
                  email: 'fake@email.fr',
                  structure: UserStructure.MILO,
                  estConseiller: true,
                  estSuperviseur: false,
                },
              },
            }
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
            motifsSuppression={[]}
          />
        )

        // When
        await userEvent.click(screen.getByRole('tab', { name: /Actions/ }))

        // Then
        expect(screen.getByText(/n’a pas encore d’action/)).toBeInTheDocument()
      })
    })

    describe("quand le jeune ne s'est jamais connecté", () => {
      beforeEach(() => {
        // Given
        renderPage(
          <FicheJeune
            jeune={{ ...jeune, isActivated: false }}
            rdvs={rdvs}
            actionsInitiales={{
              actions: [],
              page: 1,
              metadonnees: { nombreTotal: 0, nombrePages: 0 },
            }}
            conseillers={[]}
            pageTitle={''}
            motifsSuppression={[]}
          />
        )
      })

      it("affiche l'information", () => {
        // Then
        expect(
          screen.getByText('pas encore connecté', { exact: false })
        ).toBeInTheDocument()
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
            motifsSuppression={[]}
          />
        )

        // Then
        expect(screen.getByText(/ajouté temporairement/)).toBeInTheDocument()
      })
    })

    describe('quand la création de rdv est réussie', () => {
      beforeEach(() => {
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
            rdvCreationSuccess={true}
            conseillers={[]}
            pageTitle={''}
            motifsSuppression={[]}
          />
        )
      })

      it('affiche un message de succès', () => {
        // Then
        expect(
          screen.getByText('Le rendez-vous a bien été créé')
        ).toBeInTheDocument()
      })

      it('permet de cacher le message de succès', async () => {
        // Given
        const fermerMessage = screen.getByRole('button', {
          name: "J'ai compris",
        })

        // When
        await userEvent.click(fermerMessage)

        // Then
        expect(() =>
          screen.getByText('Le rendez-vous a bien été créé')
        ).toThrow()
        expect(replace).toHaveBeenCalledWith(
          { pathname: '/mes-jeunes/jeune-1' },
          undefined,
          { shallow: true }
        )
      })
    })

    describe('quand la modification de rdv est réussie', () => {
      beforeEach(() => {
        // When
        renderPage(
          <FicheJeune
            jeune={jeune}
            rdvs={rdvs}
            conseillers={[]}
            actionsInitiales={{
              actions,
              page: 1,
              metadonnees: { nombreTotal: 14, nombrePages: 2 },
            }}
            rdvModificationSuccess={true}
            pageTitle={''}
            motifsSuppression={[]}
          />
        )
      })

      it('affiche un message de succès', () => {
        // Then
        expect(
          screen.getByText('Le rendez-vous a bien été modifié')
        ).toBeInTheDocument()
      })

      it('permet de cacher le message de succès', async () => {
        // Given
        const fermerMessage = screen.getByRole('button', {
          name: "J'ai compris",
        })

        // When
        await userEvent.click(fermerMessage)

        // Then
        expect(() =>
          screen.getByText('Le rendez-vous a bien été modifié')
        ).toThrow()
        expect(replace).toHaveBeenCalledWith(
          { pathname: '/mes-jeunes/jeune-1' },
          undefined,
          { shallow: true }
        )
      })
    })

    describe('quand la création d’une action est réussie', () => {
      beforeEach(() => {
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
            actionCreationSuccess={true}
            conseillers={[]}
            pageTitle={''}
            motifsSuppression={[]}
          />
        )
      })

      it('affiche un message de succès', () => {
        // Then
        expect(
          screen.getByText('L’action a bien été créée')
        ).toBeInTheDocument()
      })

      it('permet de cacher le message de succès', async () => {
        // Given
        const fermerMessage = screen.getByRole('button', {
          name: "J'ai compris",
        })

        // When
        await userEvent.click(fermerMessage)

        // Then
        expect(() => screen.getByText('L’action a bien été créée')).toThrow()
        expect(replace).toHaveBeenCalledWith(
          { pathname: '/mes-jeunes/jeune-1' },
          undefined,
          { shallow: true }
        )
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
            motifsSuppression={[]}
            onglet={Onglet.ACTIONS}
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
            getActionsJeune: jest.fn(async (_, { page }) => ({
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
              motifsSuppression={[]}
              onglet={Onglet.ACTIONS}
            />,
            { customDependances: { actionsService } }
          )
        })

        it('met à jour les actions avec la page demandée ', async () => {
          // When
          await userEvent.click(screen.getByLabelText('Page 2'))

          // Then
          expect(actionsService.getActionsJeune).toHaveBeenCalledWith(
            jeune.id,
            { page: 2, statuts: [] },
            'accessToken'
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
          expect(actionsService.getActionsJeune).toHaveBeenCalledWith(
            jeune.id,
            { page: 1, statuts: [] },
            'accessToken'
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
          expect(actionsService.getActionsJeune).toHaveBeenCalledWith(
            jeune.id,
            { page: 6, statuts: [] },
            'accessToken'
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
          expect(actionsService.getActionsJeune).toHaveBeenCalledWith(
            jeune.id,
            { page: pageCourante - 1, statuts: [] },
            'accessToken'
          )
          expect(
            screen.getByLabelText(`Page ${pageCourante - 1}`)
          ).toHaveAttribute('aria-current', 'page')
        })

        it("permet d'aller à la page suivante", async () => {
          // When
          await userEvent.click(screen.getByLabelText('Page suivante'))

          // Then
          expect(actionsService.getActionsJeune).toHaveBeenCalledWith(
            jeune.id,
            { page: pageCourante + 1, statuts: [] },
            'accessToken'
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
          expect(actionsService.getActionsJeune).toHaveBeenCalledWith(
            jeune.id,
            { page: pageCourante - 1, statuts: [] },
            'accessToken'
          )
          expect(actionsService.getActionsJeune).toHaveBeenCalledWith(
            jeune.id,
            { page: pageCourante - 2, statuts: [] },
            'accessToken'
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
          expect(actionsService.getActionsJeune).toHaveBeenCalledTimes(1)
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
          expect(actionsService.getActionsJeune).toHaveBeenCalledTimes(1)
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
          expect(actionsService.getActionsJeune).toHaveBeenCalledTimes(0)
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
              motifsSuppression={[]}
              onglet={Onglet.ACTIONS}
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
              motifsSuppression={[]}
              onglet={Onglet.ACTIONS}
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
              motifsSuppression={[]}
              onglet={Onglet.ACTIONS}
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
              motifsSuppression={[]}
              onglet={Onglet.ACTIONS}
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
              motifsSuppression={[]}
              onglet={Onglet.ACTIONS}
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
              motifsSuppression={[]}
              onglet={Onglet.ACTIONS}
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
              motifsSuppression={[]}
              onglet={Onglet.ACTIONS}
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
              motifsSuppression={[]}
              onglet={Onglet.ACTIONS}
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
          getActionsJeune: jest.fn(async () => ({
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
            motifsSuppression={[]}
            onglet={Onglet.ACTIONS}
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
        expect(actionsService.getActionsJeune).toHaveBeenCalledWith(
          jeune.id,
          {
            page: 1,
            statuts: [StatutAction.Commencee, StatutAction.ARealiser],
          },
          'accessToken'
        )
        expect(screen.getByText('Action filtrée')).toBeInTheDocument()
      })

      it('met à jour la pagination', () => {
        expect(screen.getAllByLabelText(/Page \d+/)).toHaveLength(3)
        expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
        expect(screen.getByLabelText('Page 2')).toBeInTheDocument()
        expect(screen.getByLabelText('Page 3')).toBeInTheDocument()
      })

      it('conserve les filtres de statut', async () => {
        // When
        await userEvent.click(screen.getByLabelText('Page 2'))

        // Then
        expect(actionsService.getActionsJeune).toHaveBeenCalledWith(
          jeune.id,
          {
            page: 2,
            statuts: [StatutAction.Commencee, StatutAction.ARealiser],
          },
          'accessToken'
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
        getConseillersDuJeune: jest.fn(async () => desConseillersJeune()),
      })
      rendezVousService = mockedRendezVousService({
        getRendezVousJeune: jest.fn(async () =>
          uneListeDeRdv().concat(rdvAVenir)
        ),
      })
      actionsService = mockedActionsService({
        getActionsJeune: jest.fn(async () => ({
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
          session: { accessToken: 'accessToken', user: { structure: 'MILO' } },
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

      it('récupère la première page des actions du jeune', async () => {
        // Then
        expect(actionsService.getActionsJeune).toHaveBeenCalledWith(
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
        expect(jeunesService.getConseillersDuJeune).toHaveBeenCalledWith(
          'id-jeune',
          'accessToken'
        )
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
        expect(actionsService.getActionsJeune).toHaveBeenCalledWith(
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
          session: { accessToken: 'accessToken', user: { structure: 'MILO' } },
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
          session: { accessToken: 'accessToken', user: { structure: 'MILO' } },
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
          session: { accessToken: 'accessToken', user: { structure: 'MILO' } },
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
          session: { accessToken: 'accessToken', user: { structure: 'MILO' } },
          validSession: true,
        })

        // When
        const actual = await getServerSideProps({
          query: { creationAction: 'succes' },
        } as unknown as GetServerSidePropsContext)

        // Then
        expect(actual).toMatchObject({ props: { actionCreationSuccess: true } })
      })
    })

    describe('Quand on vient du détail d’une action', () => {
      it('récupère l’onglet sur lequel ouvrir la page', async () => {
        // Given
        ;(withMandatorySessionOrRedirect as jest.Mock).mockReturnValue({
          session: { accessToken: 'accessToken', user: { structure: 'MILO' } },
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
        expect(actionsService.getActionsJeune).not.toHaveBeenCalled()
        expect(actual).toMatchObject({
          props: { actionsInitiales: { actions: [] } },
        })
      })
    })
  })
})

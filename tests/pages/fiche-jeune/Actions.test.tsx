import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import React from 'react'

import {
  desActionsInitiales,
  uneAction,
  uneListeDActions,
} from 'fixtures/action'
import { unAgenda } from 'fixtures/agenda'
import { desIndicateursSemaine, unDetailJeune } from 'fixtures/jeune'
import {
  mockedActionsService,
  mockedAgendaService,
  mockedJeunesService,
} from 'fixtures/services'
import {
  Action,
  EtatQualificationAction,
  StatutAction,
} from 'interfaces/action'
import { StructureConseiller } from 'interfaces/conseiller'
import FicheJeune, { Onglet } from 'pages/mes-jeunes/[jeune_id]'
import { ActionsService } from 'services/actions.service'
import renderWithContexts from 'tests/renderWithContexts'
import { MetadonneesPagination } from 'types/pagination'

describe('Actions dans la fiche jeune', () => {
  const actions = uneListeDActions().concat(
    uneAction({
      id: 'id-action-5',
      content: 'Action 5',
      status: StatutAction.Terminee,
      qualification: {
        libelle: 'SNP',
        isSituationNonProfessionnelle: true,
      },
    })
  )

  let replace: jest.Mock
  beforeEach(async () => {
    replace = jest.fn(() => Promise.resolve())
    ;(useRouter as jest.Mock).mockReturnValue({
      replace: replace,
      push: jest.fn(),
    })
  })

  describe("quand l'utilisateur est un conseiller Pole emploi", () => {
    it("n'affiche pas de lien vers les actions du jeune", async () => {
      // Given
      await renderFicheJeune({ structure: StructureConseiller.POLE_EMPLOI })

      // When
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
      // Given
      await renderFicheJeune({ structure: StructureConseiller.POLE_EMPLOI })

      // Then
      expect(() => screen.getByText('Créer une nouvelle action')).toThrow()
    })
  })

  describe("quand l'utilisateur n'est pas un conseiller Pole emploi", () => {
    let setIdJeune: (id: string | undefined) => void
    beforeEach(async () => {
      // Given
      const SEPTEMBRE_1 = DateTime.fromISO('2022-09-01T14:00:00.000+02:00')
      jest.spyOn(DateTime, 'now').mockReturnValue(SEPTEMBRE_1)
      setIdJeune = jest.fn()
    })

    it('affiche les actions du jeune', async () => {
      // Given
      await renderFicheJeune({
        structure: StructureConseiller.MILO,
        actionsInitiales: {
          actions,
          page: 1,
          metadonnees: { nombreTotal: 14, nombrePages: 2 },
        },
      })

      // When
      const tabActions = screen.getByRole('tab', { name: 'Actions 14' })
      await userEvent.click(tabActions)

      // Then
      actions.forEach((action) => {
        expect(screen.getByText(action.content)).toBeInTheDocument()
      })
      expect(
        within(
          screen.getByRole('row', {
            name: `Détail de l'action ${actions[4].content}`,
          })
        ).getByLabelText(`Qualifiée en Situation Non Professionnelle`)
      ).toBeInTheDocument()

      expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
        'Actions 14'
      )
      expect(() =>
        screen.getByRole('table', { name: 'Liste de mes rendez-vous' })
      ).toThrow()
      expect(replace).toHaveBeenCalledWith(
        { pathname: '/mes-jeunes/jeune-1', query: { onglet: 'actions' } },
        undefined,
        { shallow: true }
      )
    })

    it('permet la création d’une action', async () => {
      // When
      await renderFicheJeune({ structure: StructureConseiller.MILO })

      // Then
      expect(
        screen.getByRole('link', { name: 'Créer une action' })
      ).toHaveAttribute('href', '/mes-jeunes/jeune-1/actions/nouvelle-action')
    })

    describe("quand le jeune n'a pas d'action", () => {
      it('affiche un message qui le précise', async () => {
        // Given
        await renderFicheJeune({ structure: StructureConseiller.MILO })

        // When
        await userEvent.click(screen.getByRole('tab', { name: /Actions/ }))

        // Then
        expect(screen.getByText(/n’a pas encore d’action/)).toBeInTheDocument()
      })
    })

    describe('quand on revient sur la page depuis le détail d’une action', () => {
      it('ouvre l’onglet des actions', async () => {
        // Given
        await renderFicheJeune({
          structure: StructureConseiller.MILO,
          actionsInitiales: {
            actions,
            page: 1,
            metadonnees: { nombreTotal: 14, nombrePages: 2 },
          },
          onglet: Onglet.ACTIONS,
        })

        // Then
        expect(
          screen.getByRole('tab', { selected: true })
        ).toHaveAccessibleName('Actions 14')
      })
    })

    describe('pagination actions', () => {
      let actionsService: ActionsService
      let pageCourante: number
      beforeEach(async () => {
        // Given
        actionsService = mockedActionsService({
          getActionsJeuneClientSide: jest.fn(async (_, { page }) => ({
            actions: [uneAction({ content: `Action page ${page}` })],
            metadonnees: { nombreTotal: 52, nombrePages: 6 },
          })),
        })
        pageCourante = 4

        await renderFicheJeune({
          structure: StructureConseiller.MILO,
          actionsInitiales: {
            actions,
            page: pageCourante,
            metadonnees: { nombreTotal: 52, nombrePages: 6 },
          },
          onglet: Onglet.ACTIONS,
          actionsService: actionsService,
        })
      })

      it('met à jour les actions avec la page demandée ', async () => {
        // When
        await userEvent.click(screen.getByLabelText('Page 2'))

        // Then
        expect(actionsService.getActionsJeuneClientSide).toHaveBeenCalledWith(
          'jeune-1',
          {
            page: 2,
            statuts: [],
            etatsQualification: [],
            tri: 'date_echeance_decroissante',
          }
        )
        expect(screen.getByText('Action page 2')).toBeInTheDocument()
      })

      it('met à jour la page courante', async () => {
        // When
        await userEvent.click(screen.getByLabelText('Page précédente'))
        await userEvent.click(screen.getByLabelText('Page précédente'))

        // Then
        expect(actionsService.getActionsJeuneClientSide).toHaveBeenCalledWith(
          'jeune-1',
          {
            page: pageCourante - 1,
            statuts: [],
            etatsQualification: [],
            tri: 'date_echeance_decroissante',
          }
        )

        expect(actionsService.getActionsJeuneClientSide).toHaveBeenCalledWith(
          'jeune-1',
          {
            page: pageCourante - 2,
            statuts: [],
            etatsQualification: [],
            tri: 'date_echeance_decroissante',
          }
        )
        expect(
          screen.getByLabelText(`Page ${pageCourante - 2}`)
        ).toHaveAttribute('aria-current', 'page')
      })

      it('ne recharge pas la page courante', async () => {
        // When
        await userEvent.click(screen.getByLabelText(`Page ${pageCourante}`))

        // Then
        expect(actionsService.getActionsJeuneClientSide).toHaveBeenCalledTimes(
          0
        )
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

        await renderFicheJeune({
          structure: StructureConseiller.MILO,
          actionsInitiales: {
            actions,
            page: pageCourante,
            metadonnees: { nombreTotal: 52, nombrePages: 6 },
          },
          onglet: Onglet.ACTIONS,
          actionsService: actionsService,
        })

        // When
        await userEvent.click(screen.getByText('Statut'))
        await userEvent.click(screen.getByLabelText('Commencée'))
        await userEvent.click(screen.getByLabelText('À réaliser'))
        await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
      })

      it('filtre les actions', () => {
        // Then
        expect(actionsService.getActionsJeuneClientSide).toHaveBeenCalledWith(
          'jeune-1',
          {
            page: 1,
            statuts: [StatutAction.Commencee, StatutAction.ARealiser],
            etatsQualification: [],
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
          'jeune-1',
          {
            page: 2,
            statuts: [StatutAction.Commencee, StatutAction.ARealiser],
            etatsQualification: [],
            tri: 'date_echeance_decroissante',
          }
        )
      })
    })

    describe('filtrer les actions par etat de qualification', () => {
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

        await renderFicheJeune({
          structure: StructureConseiller.MILO,
          actionsInitiales: {
            actions,
            page: pageCourante,
            metadonnees: { nombreTotal: 52, nombrePages: 6 },
          },
          onglet: Onglet.ACTIONS,
          actionsService: actionsService,
        })

        // When
        await act(() =>
          userEvent.click(
            screen.getByRole('button', { name: 'Filtrer par qualification' })
          )
        )
        await userEvent.click(screen.getByLabelText('Actions à qualifier'))
        await userEvent.click(screen.getByLabelText('Actions qualifiées'))
        await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
      })

      it('filtre les actions', () => {
        // Then
        expect(actionsService.getActionsJeuneClientSide).toHaveBeenCalledWith(
          'jeune-1',
          {
            page: 1,
            statuts: [],
            etatsQualification: [
              EtatQualificationAction.AQualifier,
              EtatQualificationAction.Qualifiee,
            ],
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

      it('conserve les filtres de qualification en changeant de page', async () => {
        // When
        await userEvent.click(screen.getByLabelText('Page 2'))

        // Then
        expect(actionsService.getActionsJeuneClientSide).toHaveBeenCalledWith(
          'jeune-1',
          {
            page: 2,
            statuts: [],
            etatsQualification: [
              EtatQualificationAction.AQualifier,
              EtatQualificationAction.Qualifiee,
            ],
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

        await renderFicheJeune({
          structure: StructureConseiller.MILO,
          actionsInitiales: {
            actions,
            page: pageCourante,
            metadonnees: { nombreTotal: 52, nombrePages: 6 },
          },
          onglet: Onglet.ACTIONS,
          actionsService: actionsService,
        })

        headerColonneDate = screen.getByRole('button', { name: /Créée le/ })
      })

      it('tri les actions par ordre croissant puis decroissant', async () => {
        // When
        await userEvent.click(headerColonneDate)
        await userEvent.click(headerColonneDate)

        // Then
        expect(actionsService.getActionsJeuneClientSide).toHaveBeenCalledWith(
          'jeune-1',
          {
            page: 1,
            statuts: [],
            etatsQualification: [],
            tri: 'date_croissante',
          }
        )
        expect(actionsService.getActionsJeuneClientSide).toHaveBeenCalledWith(
          'jeune-1',
          {
            page: 1,
            statuts: [],
            etatsQualification: [],
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
          'jeune-1',
          {
            page: 2,
            statuts: [],
            etatsQualification: [],
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

        await renderFicheJeune({
          structure: StructureConseiller.MILO,
          actionsInitiales: {
            actions,
            page: pageCourante,
            metadonnees: { nombreTotal: 52, nombrePages: 6 },
          },
          onglet: Onglet.ACTIONS,
          actionsService: actionsService,
        })

        headerColonneDate = screen.getByRole('button', { name: /Échéance/ })
      })

      it('tri les actions par ordre croissant puis decroissant', async () => {
        // When
        await userEvent.click(headerColonneDate)
        await userEvent.click(headerColonneDate)

        // Then
        expect(actionsService.getActionsJeuneClientSide).toHaveBeenCalledWith(
          'jeune-1',
          {
            page: 1,
            statuts: [],
            etatsQualification: [],
            tri: 'date_echeance_croissante',
          }
        )
        expect(actionsService.getActionsJeuneClientSide).toHaveBeenCalledWith(
          'jeune-1',
          {
            page: 1,
            statuts: [],
            etatsQualification: [],
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
          'jeune-1',
          {
            page: 2,
            statuts: [],
            etatsQualification: [],
            tri: 'date_echeance_croissante',
          }
        )
      })
    })
  })
})

interface FicheJeuneParams {
  structure: StructureConseiller
  actionsInitiales?: {
    actions: Action[]
    metadonnees: MetadonneesPagination
    page: number
  }
  onglet?: Onglet
  actionsService?: ActionsService
}

async function renderFicheJeune({
  structure,
  actionsInitiales,
  onglet,
  actionsService,
}: FicheJeuneParams) {
  await act(async () => {
    await renderWithContexts(
      <FicheJeune
        jeune={unDetailJeune()}
        rdvs={[]}
        actionsInitiales={actionsInitiales ?? desActionsInitiales()}
        onglet={onglet}
        pageTitle={''}
      />,
      {
        customConseiller: { structure: structure },
        customDependances: {
          jeunesService: mockedJeunesService({
            getIndicateursJeuneAlleges: jest.fn(async () =>
              desIndicateursSemaine()
            ),
          }),
          agendaService: mockedAgendaService({
            recupererAgenda: jest.fn(async () => unAgenda()),
          }),
          actionsService: actionsService ?? mockedActionsService(),
        },
      }
    )
  })
}

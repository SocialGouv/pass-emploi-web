import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import React from 'react'

import {
  desActionsInitiales,
  desCategories,
  uneAction,
  uneListeDActions,
} from 'fixtures/action'
import { unAgenda } from 'fixtures/agenda'
import { uneListeDeRecherches, uneListeDOffres } from 'fixtures/favoris'
import {
  desIndicateursSemaine,
  unDetailJeune,
  uneMetadonneeFavoris,
} from 'fixtures/jeune'
import { Action, StatutAction } from 'interfaces/action'
import { StructureConseiller } from 'interfaces/conseiller'
import { EvenementListItem } from 'interfaces/evenement'
import { Offre, Recherche } from 'interfaces/favoris'
import { MetadonneesFavoris } from 'interfaces/jeune'
import FicheJeune, { Onglet } from 'pages/mes-jeunes/[jeune_id]'
import {
  getActionsJeuneClientSide,
  qualifierActions,
} from 'services/actions.service'
import { recupererAgenda } from 'services/agenda.service'
import { getOffres } from 'services/favoris.service'
import { getIndicateursJeuneAlleges } from 'services/jeunes.service'
import renderWithContexts from 'tests/renderWithContexts'
import { MetadonneesPagination } from 'types/pagination'

jest.mock('services/jeunes.service')
jest.mock('services/agenda.service')
jest.mock('services/favoris.service')
jest.mock('services/actions.service')
jest.mock('components/Modal')

describe('Actions dans la fiche jeune', () => {
  const actions = uneListeDActions().concat([
    uneAction({
      id: 'id-action-5',
      content: 'Action 5',
      status: StatutAction.Terminee,
      qualification: {
        libelle: 'Santé',
        code: 'SANTE',
        isSituationNonProfessionnelle: true,
      },
    }),
    uneAction({
      id: 'id-action-6',
      content: 'Action 6',
      status: StatutAction.Qualifiee,
      qualification: {
        libelle: 'Emploi',
        code: 'EMPLOI',
        isSituationNonProfessionnelle: true,
      },
    }),
  ])

  let replace: jest.Mock
  beforeEach(async () => {
    replace = jest.fn(() => Promise.resolve())
    ;(useRouter as jest.Mock).mockReturnValue({
      replace: replace,
      push: jest.fn(),
      asPath: '/mes-jeunes',
    })
  })

  describe("quand l'utilisateur est un conseiller Pôle emploi", () => {
    let offresPE: Offre[],
      recherchesPE: Recherche[],
      metadonneesFavoris: MetadonneesFavoris
    beforeEach(async () => {
      metadonneesFavoris = uneMetadonneeFavoris()
      offresPE = uneListeDOffres()
      recherchesPE = uneListeDeRecherches()
      await renderFicheJeunePE(
        StructureConseiller.POLE_EMPLOI,
        [],
        metadonneesFavoris,
        offresPE,
        recherchesPE
      )
    })
    it("n'affiche pas de lien vers les actions du jeune", async () => {
      expect(() => screen.getByText(/Actions/)).toThrow()
    })

    it('ne permet pas la création d’action', async () => {
      // Then
      expect(() => screen.getByText('Créer une nouvelle action')).toThrow()
    })
  })

  describe("quand l'utilisateur n'est pas un conseiller Pôle emploi", () => {
    let setIdJeune: (id: string | undefined) => void
    beforeEach(async () => {
      // Given
      const SEPTEMBRE_1 = DateTime.fromISO('2022-09-01T14:00:00.000+02:00')
      jest.spyOn(DateTime, 'now').mockReturnValue(SEPTEMBRE_1)
      setIdJeune = jest.fn()
      ;(getIndicateursJeuneAlleges as jest.Mock).mockResolvedValue(
        desIndicateursSemaine()
      )
      ;(recupererAgenda as jest.Mock).mockResolvedValue(unAgenda())
      ;(getOffres as jest.Mock).mockResolvedValue(uneListeDOffres())
    })

    it('affiche les actions du jeune', async () => {
      // Given
      await renderFicheJeuneMILO({
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
            name: `Détail de l'action ${actions[5].content}`,
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

    describe('permet la multi qualification', () => {
      beforeEach(async () => {
        await renderFicheJeuneMILO({
          structure: StructureConseiller.MILO,
          actionsInitiales: {
            actions,
            page: 1,
            metadonnees: { nombreTotal: 15, nombrePages: 2 },
          },
        })

        // When
        const tabActions = screen.getByRole('tab', { name: 'Actions 15' })
        await userEvent.click(tabActions)
        ;(qualifierActions as jest.Mock).mockResolvedValue({
          idsActionsEnErreur: [],
        })
      })

      describe('quand le conseiller qualifie en SNP', () => {
        beforeEach(async () => {
          await userEvent.click(
            screen.getByRole('checkbox', {
              name: /Sélection Action 5/,
            })
          )
          await userEvent.click(
            screen.getByRole('button', {
              name: 'Qualifier les actions en SNP',
            })
          )
        })

        it('affiche la modale de qualification en SNP', () => {
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
                codeQualification: actions[4].qualification!.code,
                idAction: actions[4].id,
              },
            ],
            true
          )
        })
      })

      describe('quand le conseiller enregisre en non SNP', () => {
        beforeEach(async () => {
          await userEvent.click(
            screen.getByRole('checkbox', {
              name: /Sélection Action 5/,
            })
          )
          await userEvent.click(
            screen.getByRole('button', {
              name: 'Enregistrer les actions en non SNP',
            })
          )
        })

        it('affiche la modale d’enregistrement en non SNP', () => {
          expect(
            screen.getByText(
              'Les actions non-SNP ne sont pas transmises à i-milo, pour ne pas fausser le calcul d’heures de votre bénéficiaire.'
            )
          ).toBeInTheDocument()
          expect(
            screen.getByRole('button', { name: 'Annuler' })
          ).toBeInTheDocument()
          expect(
            screen.getByRole('button', { name: 'Enregistrer en non SNP' })
          ).toBeInTheDocument()
        })

        it('enregistre l’action', async () => {
          //When
          await userEvent.click(
            screen.getByRole('button', { name: 'Enregistrer en non SNP' })
          )

          //Then
          expect(qualifierActions).toHaveBeenCalledWith(
            [{ codeQualification: 'NON_SNP', idAction: actions[4].id }],
            false
          )
        })
      })

      describe('quand deux actions sont sélectionnées', () => {
        beforeEach(async () => {
          await userEvent.click(
            screen.getByRole('checkbox', {
              name: /Sélection Action 5/,
            })
          )
          await userEvent.click(
            screen.getByRole('checkbox', {
              name: /Sélection Consulter les offres d'emploi/,
            })
          )
          await userEvent.click(
            screen.getByRole('button', {
              name: 'Qualifier les actions en SNP',
            })
          )
          await userEvent.click(
            screen.getByRole('button', {
              name: 'Qualifier et envoyer à i-milo',
            })
          )
        })
        it('Qualifie les actions', () => {
          //Then
          expect(qualifierActions).toHaveBeenCalledWith(
            [
              {
                codeQualification: actions[4].qualification!.code,
                idAction: actions[4].id,
              },
              {
                codeQualification: actions[3].qualification!.code,
                idAction: actions[3].id,
              },
            ],
            true
          )
        })
      })
    })

    it('permet la création d’une action', async () => {
      // When
      await renderFicheJeuneMILO({ structure: StructureConseiller.MILO })

      // Then
      expect(
        screen.getByRole('link', { name: 'Créer une action' })
      ).toHaveAttribute('href', '/mes-jeunes/jeune-1/actions/nouvelle-action')
    })

    describe("quand le jeune n'a pas d'action", () => {
      it('affiche un message qui le précise', async () => {
        // Given
        await renderFicheJeuneMILO({ structure: StructureConseiller.MILO })

        // When
        await userEvent.click(screen.getByRole('tab', { name: /Actions/ }))

        // Then
        expect(
          screen.getByText(/Aucune action prévue pour/)
        ).toBeInTheDocument()
      })
    })

    describe('quand on revient sur la page depuis le détail d’une action', () => {
      it('ouvre l’onglet des actions', async () => {
        // Given
        await renderFicheJeuneMILO({
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
      let pageCourante: number
      beforeEach(async () => {
        // Given
        ;(getActionsJeuneClientSide as jest.Mock).mockImplementation(
          async (_, { page }) => ({
            actions: [uneAction({ content: `Action page ${page}` })],
            metadonnees: { nombreTotal: 52, nombrePages: 6 },
          })
        )
        pageCourante = 4

        await renderFicheJeuneMILO({
          structure: StructureConseiller.MILO,
          actionsInitiales: {
            actions,
            page: pageCourante,
            metadonnees: { nombreTotal: 52, nombrePages: 6 },
          },
          onglet: Onglet.ACTIONS,
        })
      })

      it('met à jour les actions avec la page demandée ', async () => {
        // When
        await userEvent.click(screen.getByLabelText('Page 2'))

        // Then
        expect(getActionsJeuneClientSide).toHaveBeenCalledWith('jeune-1', {
          page: 2,
          filtres: { statuts: [], categories: [] },
          tri: 'date_echeance_decroissante',
        })
        expect(screen.getByText('Action page 2')).toBeInTheDocument()
      })

      it('met à jour la page courante', async () => {
        // When
        await userEvent.click(screen.getByLabelText('Page précédente'))
        await userEvent.click(screen.getByLabelText('Page précédente'))

        // Then
        expect(getActionsJeuneClientSide).toHaveBeenCalledWith('jeune-1', {
          page: pageCourante - 1,
          filtres: { statuts: [], categories: [] },
          tri: 'date_echeance_decroissante',
        })

        expect(getActionsJeuneClientSide).toHaveBeenCalledWith('jeune-1', {
          page: pageCourante - 2,
          filtres: { statuts: [], categories: [] },
          tri: 'date_echeance_decroissante',
        })
        expect(
          screen.getByLabelText(`Page ${pageCourante - 2}`)
        ).toHaveAttribute('aria-current', 'page')
      })

      it('ne recharge pas la page courante', async () => {
        // When
        await userEvent.click(screen.getByLabelText(`Page ${pageCourante}`))

        // Then
        expect(getActionsJeuneClientSide).toHaveBeenCalledTimes(0)
      })
    })

    describe('filtrer les actions par status', () => {
      let pageCourante: number
      beforeEach(async () => {
        // Given
        ;(getActionsJeuneClientSide as jest.Mock).mockImplementation(
          async () => ({
            actions: [uneAction({ content: 'Action filtrée' })],
            metadonnees: { nombreTotal: 52, nombrePages: 3 },
          })
        )
        pageCourante = 1

        await renderFicheJeuneMILO({
          structure: StructureConseiller.MILO,
          actionsInitiales: {
            actions,
            page: pageCourante,
            metadonnees: { nombreTotal: 52, nombrePages: 6 },
          },
          onglet: Onglet.ACTIONS,
        })

        // When
        await userEvent.click(screen.getByText('Statut'))
        await userEvent.click(screen.getByLabelText('À faire'))
        await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
      })

      it('filtre les actions', () => {
        // Then
        expect(getActionsJeuneClientSide).toHaveBeenCalledWith('jeune-1', {
          page: 1,
          filtres: { statuts: [StatutAction.AFaire], categories: [] },
          tri: 'date_echeance_decroissante',
        })
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
        expect(getActionsJeuneClientSide).toHaveBeenCalledWith('jeune-1', {
          page: 2,
          filtres: { statuts: [StatutAction.AFaire], categories: [] },
          tri: 'date_echeance_decroissante',
        })
      })
    })

    describe('filtrer les actions par catégories', () => {
      let pageCourante: number
      beforeEach(async () => {
        // Given
        ;(getActionsJeuneClientSide as jest.Mock).mockImplementation(
          async () => ({
            actions: [uneAction({ content: 'Action filtrée' })],
            metadonnees: { nombreTotal: 52, nombrePages: 3 },
          })
        )
        pageCourante = 1

        await renderFicheJeuneMILO({
          structure: StructureConseiller.MILO,
          actionsInitiales: {
            actions,
            page: pageCourante,
            metadonnees: { nombreTotal: 52, nombrePages: 6 },
          },
          onglet: Onglet.ACTIONS,
        })

        // When
        await userEvent.click(screen.getByText('Catégorie'))
        await userEvent.click(screen.getByLabelText('SNP 1'))
        await userEvent.click(screen.getByRole('button', { name: 'Valider' }))
      })

      it('filtre les actions', () => {
        // Then
        expect(getActionsJeuneClientSide).toHaveBeenCalledWith('jeune-1', {
          page: 1,
          filtres: { statuts: [], categories: ['SNP_1'] },
          tri: 'date_echeance_decroissante',
        })
        expect(screen.getByText('Action filtrée')).toBeInTheDocument()
      })

      it('met à jour la pagination', () => {
        expect(screen.getAllByLabelText(/Page \d+/)).toHaveLength(3)
        expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
        expect(screen.getByLabelText('Page 2')).toBeInTheDocument()
        expect(screen.getByLabelText('Page 3')).toBeInTheDocument()
      })

      it('conserve les filtres en changeant de page', async () => {
        // When
        await userEvent.click(screen.getByLabelText('Page 2'))

        // Then
        expect(getActionsJeuneClientSide).toHaveBeenCalledWith('jeune-1', {
          page: 2,
          filtres: { statuts: [], categories: ['SNP_1'] },
          tri: 'date_echeance_decroissante',
        })
      })
    })

    describe("trier les actions par date d'échéance", () => {
      let pageCourante: number
      let headerColonneDate: HTMLButtonElement
      beforeEach(async () => {
        // Given
        ;(getActionsJeuneClientSide as jest.Mock).mockImplementation(
          async () => ({
            actions: [uneAction({ content: 'Action triée' })],
            metadonnees: { nombreTotal: 52, nombrePages: 3 },
          })
        )
        pageCourante = 1

        await renderFicheJeuneMILO({
          structure: StructureConseiller.MILO,
          actionsInitiales: {
            actions,
            page: pageCourante,
            metadonnees: { nombreTotal: 52, nombrePages: 6 },
          },
          onglet: Onglet.ACTIONS,
        })

        headerColonneDate = screen.getByRole('button', {
          name: /Date de l’action/,
        })
      })

      it('tri les actions par ordre croissant puis decroissant', async () => {
        // When
        await userEvent.click(headerColonneDate)
        await userEvent.click(headerColonneDate)

        // Then
        expect(getActionsJeuneClientSide).toHaveBeenCalledWith('jeune-1', {
          page: 1,
          filtres: { statuts: [], categories: [] },
          tri: 'date_echeance_croissante',
        })
        expect(getActionsJeuneClientSide).toHaveBeenCalledWith('jeune-1', {
          page: 1,
          filtres: { statuts: [], categories: [] },
          tri: 'date_echeance_decroissante',
        })
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
        expect(getActionsJeuneClientSide).toHaveBeenCalledWith('jeune-1', {
          page: 2,
          filtres: { statuts: [], categories: [] },
          tri: 'date_echeance_croissante',
        })
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
}

async function renderFicheJeuneMILO({
  structure,
  actionsInitiales,
  onglet,
}: FicheJeuneParams) {
  await act(async () => {
    await renderWithContexts(
      <FicheJeune
        jeune={unDetailJeune()}
        categoriesActions={desCategories()}
        rdvs={[]}
        actionsInitiales={actionsInitiales ?? desActionsInitiales()}
        onglet={onglet}
        pageTitle={''}
      />,
      {
        customConseiller: { id: 'id-conseiller', structure: structure },
      }
    )
  })
}

async function renderFicheJeunePE(
  structure: StructureConseiller,
  rdvs: EvenementListItem[] = [],
  metadonnees: MetadonneesFavoris,
  offresPE: Offre[],
  recherchesPE: Recherche[]
) {
  await act(async () => {
    await renderWithContexts(
      <FicheJeune
        jeune={unDetailJeune()}
        categoriesActions={[]}
        rdvs={rdvs}
        actionsInitiales={desActionsInitiales()}
        pageTitle={''}
        metadonneesFavoris={metadonnees}
        offresPE={offresPE}
        recherchesPE={recherchesPE}
      />,
      {
        customConseiller: {
          id: 'id-conseiller',
          structure: structure,
        },
      }
    )
  })
}

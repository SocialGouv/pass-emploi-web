import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import React from 'react'

import { desActionsInitiales } from 'fixtures/action'
import { unAgenda } from 'fixtures/agenda'
import {
  desIndicateursSemaine,
  desItemsJeunes,
  extractBaseJeune,
  unDetailJeune,
} from 'fixtures/jeune'
import { desMotifsDeSuppression } from 'fixtures/referentiel'
import { StructureConseiller } from 'interfaces/conseiller'
import { BaseJeune, DetailJeune } from 'interfaces/jeune'
import { MotifSuppressionJeune } from 'interfaces/referentiel'
import FicheJeune from 'pages/mes-jeunes/[jeune_id]'
import { AlerteParam } from 'referentiel/alerteParam'
import { recupererAgenda } from 'services/agenda.service'
import {
  archiverJeune,
  getIndicateursJeuneAlleges,
  getMotifsSuppression,
  supprimerJeuneInactif,
} from 'services/jeunes.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/jeunes.service')
jest.mock('services/agenda.service')
jest.mock('components/Modal')
jest.mock('components/PageActionsPortal')

describe('Gestion du compte dans la fiche jeune', () => {
  let motifsSuppression: MotifSuppressionJeune[]

  let alerteSetter: jest.Mock
  let portefeuilleSetter: (updatedBeneficiaires: BaseJeune[]) => void
  let push: jest.Mock
  let portefeuille: BaseJeune[]

  beforeEach(async () => {
    push = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({
      replace: jest.fn(),
      push: push,
      asPath: '/mes-jeunes',
    })
    alerteSetter = jest.fn()
    portefeuilleSetter = jest.fn()
    portefeuille = desItemsJeunes().map(extractBaseJeune)

    motifsSuppression = desMotifsDeSuppression()
    ;(getMotifsSuppression as jest.Mock).mockResolvedValue(motifsSuppression)
    ;(getIndicateursJeuneAlleges as jest.Mock).mockResolvedValue(
      desIndicateursSemaine()
    )
    ;(recupererAgenda as jest.Mock).mockResolvedValue(unAgenda())
  })

  describe('pour tous les conseillers', () => {
    it('affiche un bouton pour supprimer le compte d’un bénéficiaire', async () => {
      // Given
      await renderFicheJeune(StructureConseiller.PASS_EMPLOI, unDetailJeune())

      // Then
      const deleteButton = screen.getByText('Supprimer ce compte')
      expect(deleteButton).toBeInTheDocument()
    })

    describe('Supprimer un compte actif', () => {
      beforeEach(async () => {
        // Given
        await renderFicheJeune(
          StructureConseiller.PASS_EMPLOI,
          unDetailJeune({ isActivated: true }),
          portefeuilleSetter,
          alerteSetter
        )
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
            screen.getByText(/Une fois confirmé toutes les informations liées/)
          ).toBeInTheDocument()
        })

        it('contient un champ de sélection d’un motif', async () => {
          const selectMotif = screen.getByRole('combobox', {
            name: /Motif de suppression/,
          })

          // Then
          expect(selectMotif).toHaveAttribute('required', '')
          motifsSuppression.forEach(({ motif }) => {
            expect(
              within(selectMotif).getByRole('option', { name: motif })
            ).toBeInTheDocument()
          })
        })

        it('affiche une description au motif quand il y en a une', async () => {
          // Given
          const selectMotif = screen.getByRole('combobox', {
            name: /Motif de suppression/,
          })

          // When
          await userEvent.selectOptions(
            selectMotif,
            'Emploi durable (plus de 6 mois)'
          )

          // Then
          expect(
            screen.getByText(
              /CDI, CDD de plus de 6 mois dont alternance, titularisation dans la fonction publique/
            )
          ).toBeInTheDocument()
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
          await userEvent.selectOptions(
            selectMotif,
            'Demande du jeune de sortir du dispositif'
          )

          // When
          await userEvent.click(supprimerButtonModal)

          // Then
          expect(archiverJeune).toHaveBeenCalledWith('jeune-1', {
            motif: 'Demande du jeune de sortir du dispositif',
            commentaire: undefined,
          })

          expect(portefeuilleSetter).toHaveBeenCalledWith([
            portefeuille[1],
            portefeuille[2],
          ])
          expect(alerteSetter).toHaveBeenCalledWith('suppressionBeneficiaire')
          expect(push).toHaveBeenCalledWith('/mes-jeunes')
        })
      })
    })

    describe('Supprimer un compte inactif', () => {
      beforeEach(async () => {
        // Given
        await renderFicheJeune(
          StructureConseiller.PASS_EMPLOI,
          unDetailJeune({ isActivated: false }),
          portefeuilleSetter,
          alerteSetter
        )
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
        expect(supprimerJeuneInactif).toHaveBeenCalledWith('jeune-1')

        expect(portefeuilleSetter).toHaveBeenCalledWith([
          portefeuille[1],
          portefeuille[2],
        ])
        expect(alerteSetter).toHaveBeenCalledWith('suppressionBeneficiaire')
        expect(push).toHaveBeenCalledWith('/mes-jeunes')
      })
    })

    describe('quand le jeune a été réaffecté temporairement', () => {
      it("affiche l'information", async () => {
        // Given
        await renderFicheJeune(
          StructureConseiller.PASS_EMPLOI,
          unDetailJeune({ isReaffectationTemporaire: true })
        )

        // Then
        expect(screen.getByText(/ajouté temporairement/)).toBeInTheDocument()
      })
    })
  })

  describe('quand l’utilisateur est un conseiller MILO', () => {
    describe("quand le jeune n'a pas activé son compte", () => {
      it('affiche le mode opératoire pour activer le compte', async () => {
        // Given
        await renderFicheJeune(
          StructureConseiller.MILO,
          unDetailJeune({ isActivated: false })
        )

        // Then
        expect(
          screen.getByText(/Le lien d’activation est valable 12h/)
        ).toBeInTheDocument()
      })
    })
  })
})

async function renderFicheJeune(
  structure: StructureConseiller,
  jeune: DetailJeune,
  portefeuilleSetter?: (updatedBeneficiaires: BaseJeune[]) => void,
  alerteSetter?: (key: AlerteParam | undefined, target?: string) => void
) {
  await act(async () => {
    await renderWithContexts(
      <FicheJeune
        jeune={jeune}
        rdvs={[]}
        actionsInitiales={desActionsInitiales()}
        pageTitle={''}
      />,
      {
        customConseiller: { id: 'id-conseiller', structure: structure },
        customPortefeuille: { setter: portefeuilleSetter },
        customAlerte: { alerteSetter },
      }
    )
  })
}

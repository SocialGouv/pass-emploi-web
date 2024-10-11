import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import React from 'react'

import FicheBeneficiairePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiairePage'
import { desActionsInitiales, desCategories } from 'fixtures/action'
import { unAgenda } from 'fixtures/agenda'
import {
  desIndicateursSemaine,
  desItemsBeneficiaires,
  extractBaseBeneficiaire,
  unDetailBeneficiaire,
} from 'fixtures/beneficiaire'
import { desMotifsDeSuppression } from 'fixtures/referentiel'
import { BaseBeneficiaire, DetailBeneficiaire } from 'interfaces/beneficiaire'
import { StructureConseiller } from 'interfaces/conseiller'
import { MotifSuppressionBeneficiaire } from 'interfaces/referentiel'
import { AlerteParam } from 'referentiel/alerteParam'
import { recupererAgenda } from 'services/agenda.service'
import {
  archiverJeune,
  getIndicateursJeuneAlleges,
  getMotifsSuppression,
  supprimerJeuneInactif,
} from 'services/beneficiaires.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/beneficiaires.service')
jest.mock('services/agenda.service')
jest.mock('components/Modal')
jest.mock('components/PageActionsPortal')

describe('Gestion du compte dans la fiche jeune', () => {
  let motifsSuppression: MotifSuppressionBeneficiaire[]

  let alerteSetter: jest.Mock
  let portefeuilleSetter: (updatedBeneficiaires: BaseBeneficiaire[]) => void
  let push: jest.Mock
  let portefeuille: BaseBeneficiaire[]

  beforeEach(async () => {
    push = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({ push })
    alerteSetter = jest.fn()
    portefeuilleSetter = jest.fn()
    portefeuille = desItemsBeneficiaires().map(extractBaseBeneficiaire)

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
      await renderFicheJeune(unDetailBeneficiaire())

      // Then
      const deleteButton = screen.getByText('Supprimer ce compte')
      expect(deleteButton).toBeInTheDocument()
    })

    describe('Supprimer un compte actif', () => {
      beforeEach(async () => {
        // Given
        await renderFicheJeune(
          unDetailBeneficiaire({ isActivated: true }),
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
          screen.getByText(/Souhaitez-vous supprimer le compte bénéficiaire/)
        ).toBeInTheDocument()
      })

      describe('Seconde étape suppression modale', () => {
        beforeEach(async () => {
          // Given
          const afficheSecondeEtapeButton = screen.getAllByRole('button', {
            name: 'Supprimer ce compte',
          })[1]

          // When
          await userEvent.click(afficheSecondeEtapeButton)
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
          const supprimerButtonModal = screen.getByText('Supprimer le compte')
          await userEvent.selectOptions(
            selectMotif,
            'Demande du jeune de sortir du dispositif'
          )

          // When
          await userEvent.click(supprimerButtonModal)

          // Then
          expect(archiverJeune).toHaveBeenCalledWith('beneficiaire-1', {
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
          unDetailBeneficiaire({ isActivated: false }),
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
        const supprimerButtonModal = screen.getByText('Supprimer le compte')

        // When
        await userEvent.click(supprimerButtonModal)

        // Then
        expect(supprimerJeuneInactif).toHaveBeenCalledWith('beneficiaire-1')

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
          unDetailBeneficiaire({ isReaffectationTemporaire: true })
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
        await renderFicheJeune(unDetailBeneficiaire({ isActivated: false }))

        // Then
        expect(
          screen.getByText(
            /Le lien d’activation envoyé par i-milo à l’adresse e-mail du bénéficiaire n’est valable que 24h/
          )
        ).toBeInTheDocument()
      })
    })
  })
})

async function renderFicheJeune(
  jeune: DetailBeneficiaire,
  portefeuilleSetter?: (updatedBeneficiaires: BaseBeneficiaire[]) => void,
  alerteSetter?: (key: AlerteParam | undefined, target?: string) => void
) {
  await act(async () => {
    renderWithContexts(
      <FicheBeneficiairePage
        estMilo={true}
        beneficiaire={jeune}
        rdvs={[]}
        actionsInitiales={desActionsInitiales()}
        categoriesActions={desCategories()}
        ongletInitial='agenda'
        lectureSeule={false}
      />,
      {
        customConseiller: {
          id: 'id-conseiller',
          structure: StructureConseiller.MILO,
        },
        customPortefeuille: { setter: portefeuilleSetter },
        customAlerte: { setter: alerteSetter },
      }
    )
  })
}

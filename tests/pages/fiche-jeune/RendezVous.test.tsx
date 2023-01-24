import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router'
import React from 'react'

import { desActionsInitiales } from 'fixtures/action'
import { unAgenda } from 'fixtures/agenda'
import { desEvenementsListItems } from 'fixtures/evenement'
import { desIndicateursSemaine, unDetailJeune } from 'fixtures/jeune'
import { mockedAgendaService, mockedJeunesService } from 'fixtures/services'
import { StructureConseiller } from 'interfaces/conseiller'
import { EvenementListItem } from 'interfaces/evenement'
import FicheJeune from 'pages/mes-jeunes/[jeune_id]'
import renderWithContexts from 'tests/renderWithContexts'

describe('Rendez-vous de la fiche jeune', () => {
  const rdvs = desEvenementsListItems()

  beforeEach(async () => {
    ;(useRouter as jest.Mock).mockReturnValue({
      replace: jest.fn(() => Promise.resolve()),
      push: jest.fn(),
    })
  })

  describe("quand l'utilisateur n'est pas un conseiller Pole emploi", () => {
    beforeEach(async () => {
      await renderFicheJeune(StructureConseiller.MILO, rdvs)
    })

    it('affiche la liste des rendez-vous du jeune', async () => {
      // Given
      await userEvent.click(screen.getByRole('tab', { name: /Rendez-vous/ }))

      // Then
      expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
        'Rendez-vous 2'
      )
      rdvs.forEach((rdv) => {
        expect(screen.getByText(rdv.type)).toBeInTheDocument()
        expect(screen.getByText(rdv.modality)).toBeInTheDocument()
      })
      expect(() =>
        screen.getByRole('table', { name: /Liste des actions de/ })
      ).toThrow()
    })

    it('indique caractère non modifiable d’un rendez-vous issu d’i-Milo', async () => {
      // Given
      await userEvent.click(screen.getByRole('tab', { name: /Rendez-vous/ }))

      // Then
      expect(screen.getByLabelText('Non modifiable')).toBeInTheDocument()
    })

    it('affiche un lien vers les rendez-vous passés du jeune', async () => {
      // Given
      await userEvent.click(screen.getByRole('tab', { name: /Rendez-vous/ }))

      // Then
      expect(
        screen.getByRole('link', { name: 'Voir les événements passés' })
      ).toHaveAttribute('href', '/mes-jeunes/jeune-1/rendez-vous-passes')
    })

    it('permet la prise de rendez-vous', async () => {
      // Then
      expect(
        screen.getByRole('link', { name: 'Créer un rendez-vous' })
      ).toHaveAttribute('href', '/mes-jeunes/edition-rdv?idJeune=jeune-1')
    })
  })

  describe("quand l'utilisateur est un conseiller Pole emploi", () => {
    beforeEach(async () => {
      await renderFicheJeune(StructureConseiller.POLE_EMPLOI, [])
    })

    it("n'affiche pas la liste des rendez-vous du jeune", async () => {
      // Given
      await userEvent.click(screen.getByRole('tab', { name: /Rendez-vous/ }))

      // Then
      expect(
        screen.getByText(
          'Gérez les convocations de ce jeune depuis vos outils Pôle emploi.'
        )
      ).toBeInTheDocument()
    })

    it('ne permet pas la prise de rendez-vous', async () => {
      // Then
      expect(() => screen.getByText('Créer un rendez-vous')).toThrow()
    })
  })
})

async function renderFicheJeune(
  structure: StructureConseiller,
  rdvs: EvenementListItem[] = []
) {
  await act(async () => {
    await renderWithContexts(
      <FicheJeune
        jeune={unDetailJeune()}
        rdvs={rdvs}
        actionsInitiales={desActionsInitiales()}
        pageTitle={''}
      />,
      {
        customConseiller: { structure: structure },
        customDependances: {
          jeunesService: mockedJeunesService({
            getIndicateursJeuneAlleges: jest.fn(async () => desIndicateursSemaine()),
          }),
          agendaService: mockedAgendaService({
            recupererAgenda: jest.fn(async () => unAgenda()),
          }),
        },
      }
    )
  })
}

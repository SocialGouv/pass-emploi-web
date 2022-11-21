import { act, screen } from '@testing-library/react'
import React from 'react'

import { desActionsInitiales } from 'fixtures/action'
import { unAgenda } from 'fixtures/agenda'
import { desIndicateursSemaine, unDetailJeune } from 'fixtures/jeune'
import { mockedAgendaService, mockedJeunesService } from 'fixtures/services'
import { StatutAction } from 'interfaces/action'
import { EntreeAgenda } from 'interfaces/agenda'
import { StructureConseiller } from 'interfaces/conseiller'
import FicheJeune from 'pages/mes-jeunes/[jeune_id]'
import { AgendaService } from 'services/agenda.service'
import renderWithContexts from 'tests/renderWithContexts'

describe('Agenda de la fiche jeune', () => {
  let agendaService: AgendaService

  describe("quand l'utilisateur est un conseiller Pole emploi", () => {
    it("n'affiche pas l’agenda du jeune (et ne tente pas de le récupérer)", async () => {
      // Given
      agendaService = mockedAgendaService()

      // When
      await renderFicheJeune(StructureConseiller.POLE_EMPLOI, agendaService)

      // Then
      expect(
        screen.getByText(
          'Gérez les convocations et démarches de ce jeune depuis vos outils Pôle emploi.'
        )
      ).toBeInTheDocument()

      expect(agendaService.recupererAgenda).not.toHaveBeenCalled()
    })
  })

  describe('quand l’utilisateur n’est pas un conseiller Pole emploi', () => {
    describe('affiche l’agenda du jeune', () => {
      it('avec un message si le jeune n’a rien sur la période', async () => {
        // Given
        agendaService = mockedAgendaService({
          recupererAgenda: jest.fn(async () => unAgenda()),
        })

        // When
        await renderFicheJeune(StructureConseiller.MILO, agendaService)

        // Then
        expect(
          screen.getByRole('tab', {
            name: /Agenda/,
          })
        ).toBeInTheDocument()
        expect(
          screen.getByText(
            'Il n’y a pas encore de rendez-vous ni d’action prévus sur cette période.'
          )
        ).toBeInTheDocument()
      })

      it('avec des rendez-vous et des actions si le jeune en a sur la période', async () => {
        // Given
        agendaService = mockedAgendaService({
          recupererAgenda: jest.fn(async () =>
            unAgenda({
              entrees: [
                {
                  id: 'id-action-1',
                  type: 'action',
                  titre: 'Identifier ses atouts et ses compétences',
                  statut: StatutAction.ARealiser,
                } as EntreeAgenda,
                {
                  id: '1',
                  type: 'evenement',
                  titre: '12h00 - Autre',
                } as EntreeAgenda,
              ],
            })
          ),
        })

        // When
        await renderFicheJeune(StructureConseiller.MILO, agendaService)

        // Then
        expect(
          screen.getByRole('tab', {
            name: /Agenda/,
          })
        ).toBeInTheDocument()
        expect(
          screen.getByText('Identifier ses atouts et ses compétences')
        ).toBeInTheDocument()
        expect(screen.getByText('À réaliser')).toBeInTheDocument()
        expect(screen.getByText(/12h00 - Autre/)).toBeInTheDocument()
      })
    })
  })
})

async function renderFicheJeune(
  structure: StructureConseiller,
  agendaService: AgendaService
) {
  await act(async () => {
    await renderWithContexts(
      <FicheJeune
        jeune={unDetailJeune()}
        rdvs={[]}
        actionsInitiales={desActionsInitiales()}
        pageTitle={''}
      />,
      {
        customConseiller: { structure: structure },
        customDependances: {
          jeunesService: mockedJeunesService({
            getIndicateursJeune: jest.fn(async () => desIndicateursSemaine()),
          }),
          agendaService: agendaService,
        },
      }
    )
  })
}

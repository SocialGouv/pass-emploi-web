import { act, screen, within } from '@testing-library/react'
import { DateTime } from 'luxon'
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
  const JANVIER_5 = DateTime.local(2022, 1, 5)
  const UNE_DATE_SEMAINE_EN_COURS = DateTime.local(2022, 1, 3)
  const UNE_DATE_SEMAINE_SUIVANTE = DateTime.local(2022, 1, 10)

  let agendaService: AgendaService

  beforeEach(() => {
    jest.spyOn(DateTime, 'now').mockReturnValue(JANVIER_5)
  })

  describe('pour tous les conseillers', () => {
    it('affiche un onglet Agenda', async () => {
      // Given
      agendaService = mockedAgendaService()

      // When
      await renderFicheJeune(StructureConseiller.POLE_EMPLOI, agendaService)

      // Then
      expect(screen.getByRole('tab', { name: /Agenda/ })).toBeInTheDocument()
    })
  })

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
      it('avec un message si le jeune n’a rien sur la semaine en cours', async () => {
        // Given
        agendaService = mockedAgendaService({
          recupererAgenda: jest.fn(async () =>
            unAgenda({
              entrees: [
                {
                  id: '1',
                  date: UNE_DATE_SEMAINE_SUIVANTE,
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
        const semaineEnCours = screen.getByRole('region', {
          name: 'Semaine en cours',
        })
        expect(
          within(semaineEnCours).getByRole('heading', {
            level: 2,
            name: 'Semaine en cours',
          })
        ).toBeInTheDocument()
        expect(
          within(semaineEnCours).getByText(
            'Du lundi 3 janvier au vendredi 7 janvier'
          )
        ).toBeInTheDocument()
        expect(
          within(semaineEnCours).getByText('Pas d’action ni de rendez-vous')
        ).toBeInTheDocument()
      })

      it('avec un message si le jeune n’a rien sur la semaine suivante', async () => {
        // Given
        agendaService = mockedAgendaService({
          recupererAgenda: jest.fn(async () =>
            unAgenda({
              entrees: [
                {
                  id: '1',
                  date: UNE_DATE_SEMAINE_EN_COURS,
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
        const semaineSuivante = screen.getByRole('region', {
          name: 'Semaine suivante',
        })
        expect(
          within(semaineSuivante).getByRole('heading', {
            level: 2,
            name: 'Semaine suivante',
          })
        ).toBeInTheDocument()
        expect(
          within(semaineSuivante).getByText(
            'Du lundi 10 janvier au vendredi 14 janvier'
          )
        ).toBeInTheDocument()
        expect(
          within(semaineSuivante).getByText('Pas d’action ni de rendez-vous')
        ).toBeInTheDocument()
      })

      it('avec des rendez-vous et des actions séparés par semaine si le jeune en a', async () => {
        // Given
        agendaService = mockedAgendaService({
          recupererAgenda: jest.fn(async () =>
            unAgenda({
              entrees: [
                {
                  id: 'id-action-1',
                  date: UNE_DATE_SEMAINE_EN_COURS,
                  type: 'action',
                  titre: 'Identifier ses atouts et ses compétences',
                  statut: StatutAction.ARealiser,
                } as EntreeAgenda,
                {
                  id: '1',
                  date: UNE_DATE_SEMAINE_SUIVANTE,
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
        const semaineEnCours = screen.getByRole('region', {
          name: 'Semaine en cours',
        })
        expect(
          within(semaineEnCours).getByRole('heading', {
            level: 2,
            name: 'Semaine en cours',
          })
        ).toBeInTheDocument()
        expect(
          within(semaineEnCours).getByText(
            'Identifier ses atouts et ses compétences'
          )
        ).toBeInTheDocument()
        expect(
          within(semaineEnCours).getByText('À réaliser')
        ).toBeInTheDocument()

        const semaineSuivante = screen.getByRole('region', {
          name: 'Semaine suivante',
        })
        expect(
          within(semaineSuivante).getByRole('heading', {
            level: 2,
            name: 'Semaine suivante',
          })
        ).toBeInTheDocument()
        expect(
          within(semaineSuivante).getByText(/12h00 - Autre/)
        ).toBeInTheDocument()
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

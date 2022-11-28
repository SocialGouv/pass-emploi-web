import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
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
  const UNE_DATE_SEMAINE_EN_COURS = DateTime.local(2022, 1, 3)
  const UNE_DATE_SEMAINE_SUIVANTE = DateTime.local(2022, 1, 10)
  const SAMEDI_JANVIER_1 = DateTime.local(2022, 1, 1)
  const DIMANCHE_JANVIER_2 = DateTime.local(2022, 1, 2)
  const LUNDI_JANVIER_3 = DateTime.local(2022, 1, 3)
  const SAMEDI_JANVIER_8 = DateTime.local(2022, 1, 8)

  let agendaService: AgendaService
  let replace: jest.Mock

  beforeEach(() => {
    jest.spyOn(DateTime, 'now').mockReturnValue(LUNDI_JANVIER_3)
    replace = jest.fn(() => Promise.resolve())
    ;(useRouter as jest.Mock).mockReturnValue({
      replace: replace,
      push: jest.fn(),
    })
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
    it("n'affiche pas l’agenda du bénéficiaire (et ne tente pas de le récupérer)", async () => {
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
    describe('affiche l’agenda du bénéficiaire', () => {
      it('affiche les actions en retard dans la vue agenda ', async () => {
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
              metadata: {
                dateDeDebut: DateTime.fromISO('2022-01-01T14:00:00.000+02:00'),
                dateDeFin: DateTime.fromISO('2022-01-15T14:00:00.000+02:00'),
                actionsEnRetard: 8,
              },
            })
          ),
        })
        // When
        await renderFicheJeune(StructureConseiller.MILO, agendaService)
        const voirActionsEnRetard = screen.getByRole('button', {
          name: 'Voir les actions',
        })

        // Then
        expect(screen.getByText('Actions en retard (8)')).toBeInTheDocument()
        expect(voirActionsEnRetard).toBeInTheDocument()

        await userEvent.click(voirActionsEnRetard)
        expect(screen.getByRole('tab', { name: 'Actions 0' })).toHaveAttribute(
          'aria-selected',
          'true'
        )
      })
      it('avec un message si le bénéficiaire n’a rien sur la semaine en cours', async () => {
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

      it('avec un message si le bénéficiaire n’a rien sur la semaine suivante', async () => {
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

      describe('si le bénéficiaire a des actions et des rendez-vous', () => {
        it('ils sont séparés par semaine', async () => {
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
            within(semaineSuivante).getByText('12h00 - Autre')
          ).toBeInTheDocument()
        })

        it('ils sont groupés par jour', async () => {
          // Given
          agendaService = mockedAgendaService({
            recupererAgenda: jest.fn(async () =>
              unAgenda({
                entrees: [
                  {
                    id: 'id-action-1',
                    date: SAMEDI_JANVIER_1,
                    type: 'action',
                    titre: 'Action du samedi 1',
                    statut: StatutAction.ARealiser,
                  } as EntreeAgenda,
                  {
                    id: '1',
                    date: SAMEDI_JANVIER_1,
                    type: 'evenement',
                    titre: '12h00 - Rdv du samedi 1',
                  } as EntreeAgenda,
                  {
                    id: '1',
                    date: LUNDI_JANVIER_3,
                    type: 'evenement',
                    titre: '15h00 - Rdv du lundi 3',
                  } as EntreeAgenda,
                  {
                    id: '1',
                    date: SAMEDI_JANVIER_8,
                    type: 'evenement',
                    titre: 'Action du samedi 8',
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
          expectContenuCeJour(
            semaineEnCours,
            'Samedi 1 janvier',
            'Action du samedi 1'
          )
          expectContenuCeJour(
            semaineEnCours,
            'Samedi 1 janvier',
            '12h00 - Rdv du samedi 1'
          )
          expectAucuneEntreeCeJour(semaineEnCours, 'Dimanche 2 janvier')
          expectContenuCeJour(
            semaineEnCours,
            'Lundi 3 janvier',
            '15h00 - Rdv du lundi 3'
          )
          expectAucuneEntreeCeJour(semaineEnCours, 'Mardi 4 janvier')
          expectAucuneEntreeCeJour(semaineEnCours, 'Mercredi 5 janvier')
          expectAucuneEntreeCeJour(semaineEnCours, 'Jeudi 6 janvier')
          expectAucuneEntreeCeJour(semaineEnCours, 'Vendredi 7 janvier')

          const semaineSuivante = screen.getByRole('region', {
            name: 'Semaine suivante',
          })
          expect(
            within(semaineSuivante).getByRole('heading', {
              level: 2,
              name: 'Semaine suivante',
            })
          ).toBeInTheDocument()
          expectContenuCeJour(
            semaineSuivante,
            'Samedi 8 janvier',
            'Action du samedi 8'
          )
          expectAucuneEntreeCeJour(semaineSuivante, 'Dimanche 9 janvier')
          expectAucuneEntreeCeJour(semaineSuivante, 'Lundi 10 janvier')
          expectAucuneEntreeCeJour(semaineSuivante, 'Mardi 11 janvier')
          expectAucuneEntreeCeJour(semaineSuivante, 'Mercredi 12 janvier')
          expectAucuneEntreeCeJour(semaineSuivante, 'Jeudi 13 janvier')
          expectAucuneEntreeCeJour(semaineSuivante, 'Vendredi 14 janvier')
        })

        it('n’affiche pas le samedi si les entrées commencent le dimanche', async () => {
          // Given
          agendaService = mockedAgendaService({
            recupererAgenda: jest.fn(async () =>
              unAgenda({
                entrees: [
                  {
                    id: 'id-action-1',
                    date: DIMANCHE_JANVIER_2,
                    type: 'action',
                    titre: 'Action du dimanche 2',
                    statut: StatutAction.ARealiser,
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
          expect(() =>
            within(semaineEnCours).getByRole('heading', {
              level: 3,
              name: 'Samedi 1 janvier',
            })
          ).toThrow()
        })

        it('n’affiche ni le samedi ni le dimanche si les entrées commencent dans la semaine', async () => {
          // Given
          agendaService = mockedAgendaService({
            recupererAgenda: jest.fn(async () =>
              unAgenda({
                entrees: [
                  {
                    id: 'id-action-1',
                    date: LUNDI_JANVIER_3,
                    type: 'action',
                    titre: 'Action du lundi 3',
                    statut: StatutAction.ARealiser,
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
          expect(() =>
            within(semaineEnCours).getByRole('heading', {
              level: 3,
              name: 'Samedi 1 janvier',
            })
          ).toThrow()
          expect(() =>
            within(semaineEnCours).getByRole('heading', {
              level: 3,
              name: 'Dimanche 2 janvier',
            })
          ).toThrow()
        })
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

function expectContenuCeJour(
  semaine: HTMLElement,
  jour: string,
  contenu: string
) {
  const sectionDuJour = within(semaine).getByRole('region', { name: jour })
  expect(
    within(sectionDuJour).getByRole('heading', {
      level: 3,
      name: jour,
    })
  ).toBeInTheDocument()
  expect(within(sectionDuJour).getByText(contenu)).toBeInTheDocument()
}

function expectAucuneEntreeCeJour(semaine: HTMLElement, jour: string) {
  expectContenuCeJour(semaine, jour, 'Pas d’action ni de rendez-vous')
}

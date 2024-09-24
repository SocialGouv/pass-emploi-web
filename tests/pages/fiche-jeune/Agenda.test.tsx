import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { useRouter } from 'next/navigation'
import React from 'react'

import FicheBeneficiairePage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/FicheBeneficiairePage'
import { desActionsInitiales, desCategories } from 'fixtures/action'
import { unAgenda } from 'fixtures/agenda'
import {
  desIndicateursSemaine,
  unDetailBeneficiaire,
  uneMetadonneeFavoris,
} from 'fixtures/beneficiaire'
import { uneListeDeRecherches, uneListeDOffres } from 'fixtures/favoris'
import { StatutAction } from 'interfaces/action'
import { EntreeAgenda } from 'interfaces/agenda'
import { MetadonneesFavoris } from 'interfaces/beneficiaire'
import { StructureConseiller } from 'interfaces/conseiller'
import { EvenementListItem } from 'interfaces/evenement'
import { Offre, Recherche } from 'interfaces/favoris'
import { recupererAgenda } from 'services/agenda.service'
import { getIndicateursJeuneAlleges } from 'services/beneficiaires.service'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/beneficiaires.service')
jest.mock('services/agenda.service')

describe('Agenda de la fiche jeune', () => {
  const UNE_DATE_SEMAINE_EN_COURS = DateTime.local(2022, 1, 3)
  const UNE_DATE_SEMAINE_SUIVANTE = DateTime.local(2022, 1, 10)
  const SAMEDI_JANVIER_1 = DateTime.local(2022, 1, 1)
  const LUNDI_JANVIER_3 = DateTime.local(2022, 1, 3)
  const SAMEDI_JANVIER_8 = DateTime.local(2022, 1, 8)

  let replace: jest.Mock

  beforeEach(() => {
    jest.spyOn(DateTime, 'now').mockReturnValue(LUNDI_JANVIER_3)
    replace = jest.fn(() => Promise.resolve())
    ;(useRouter as jest.Mock).mockReturnValue({ replace })
    ;(getIndicateursJeuneAlleges as jest.Mock).mockResolvedValue(
      desIndicateursSemaine()
    )
    ;(recupererAgenda as jest.Mock).mockResolvedValue(unAgenda())
  })

  describe("quand l'utilisateur est un conseiller France Travail", () => {
    it('ne tente pas de récupérer l’agenda du bénéficiaire', async () => {
      // Given
      const metadonneesFavoris = uneMetadonneeFavoris()
      const offresFT = uneListeDOffres()
      const recherchesFT = uneListeDeRecherches()

      // When
      await renderFicheJeuneFT(
        StructureConseiller.POLE_EMPLOI,
        [],
        metadonneesFavoris,
        offresFT,
        recherchesFT
      )

      // Then
      expect(recupererAgenda).not.toHaveBeenCalled()
    })
  })

  describe('quand l’utilisateur n’est pas un conseiller France Travail', () => {
    it('affiche un onglet Agenda', async () => {
      // Given
      ;(recupererAgenda as jest.Mock).mockResolvedValue(
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
      )

      // When
      await renderFicheJeuneMILO(StructureConseiller.MILO)

      // Then
      expect(screen.getByRole('tab', { name: /Agenda/ })).toBeInTheDocument()
    })

    describe('affiche l’agenda du bénéficiaire', () => {
      it('affiche les actions en retard dans la vue agenda ', async () => {
        // Given
        ;(recupererAgenda as jest.Mock).mockResolvedValue(
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
        )

        // When
        await renderFicheJeuneMILO(StructureConseiller.MILO)
        const voirActionsEnRetard = screen.getByRole('button', {
          name: 'Voir les actions',
        })

        // Then
        expect(screen.getByText('Actions en retard (8)')).toBeInTheDocument()
        expect(voirActionsEnRetard).toBeInTheDocument()

        await userEvent.click(voirActionsEnRetard)
        expect(
          screen.getByRole('tab', { name: 'Actions 0 éléments' })
        ).toHaveAttribute('aria-selected', 'true')
      })
      it('avec un message si le bénéficiaire n’a rien sur la semaine en cours', async () => {
        // Given
        ;(recupererAgenda as jest.Mock).mockResolvedValue(
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
        )

        // When
        await renderFicheJeuneMILO(StructureConseiller.MILO)

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
            'Du lundi 3 janvier au dimanche 9 janvier'
          )
        ).toBeInTheDocument()
        expect(
          within(semaineEnCours).getByText('Pas d’action ni de rendez-vous')
        ).toBeInTheDocument()
      })

      it('avec un message si le bénéficiaire n’a rien sur la semaine suivante', async () => {
        // Given
        ;(recupererAgenda as jest.Mock).mockResolvedValue(
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
        )

        // When
        await renderFicheJeuneMILO(StructureConseiller.MILO)

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
            'Du lundi 10 janvier au dimanche 16 janvier'
          )
        ).toBeInTheDocument()
        expect(
          within(semaineSuivante).getByText('Pas d’action ni de rendez-vous')
        ).toBeInTheDocument()
      })

      describe('si le bénéficiaire a des actions et des rendez-vous', () => {
        it('ils sont séparés par semaine', async () => {
          // Given
          ;(recupererAgenda as jest.Mock).mockResolvedValue(
            unAgenda({
              entrees: [
                {
                  id: 'id-action-1',
                  date: UNE_DATE_SEMAINE_EN_COURS,
                  type: 'action',
                  titre: 'Identifier ses atouts et ses compétences',
                  statut: StatutAction.AFaire,
                } as EntreeAgenda,
                {
                  id: '1',
                  date: UNE_DATE_SEMAINE_SUIVANTE,
                  type: 'evenement',
                  titre: '12h00 - Autre',
                } as EntreeAgenda,
              ],
            })
          )

          // When
          await renderFicheJeuneMILO(StructureConseiller.MILO)

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
            within(semaineEnCours).getByText('À faire')
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
          ;(recupererAgenda as jest.Mock).mockResolvedValue(
            unAgenda({
              entrees: [
                {
                  id: 'id-action-1',
                  date: SAMEDI_JANVIER_1,
                  type: 'action',
                  titre: 'Action du samedi 1',
                  statut: StatutAction.AFaire,
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
          )

          // When
          await renderFicheJeuneMILO(StructureConseiller.MILO)

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
      })

      describe('si le bénéficiaire a des rendez-vous créés par i-milo', () => {
        it('indique le caractère non modifiable de l’événement', async () => {
          // Given
          ;(recupererAgenda as jest.Mock).mockResolvedValue(
            unAgenda({
              entrees: [
                {
                  id: '1',
                  date: LUNDI_JANVIER_3,
                  type: 'evenement',
                  titre: '15h00 - Rdv du lundi 3',
                  source: StructureConseiller.MILO,
                } as EntreeAgenda,
              ],
            })
          )

          // When
          await renderFicheJeuneMILO(StructureConseiller.MILO)

          // Then
          expect(screen.getByText('Non modifiable')).toBeInTheDocument()
        })
      })

      describe('si le bénéficiaire a des éléments qui ne sont pas dans les bornes', () => {
        it("ignore les éléments sans lever d'erreur", async () => {
          // Given
          ;(recupererAgenda as jest.Mock).mockResolvedValue({
            entrees: [
              {
                date: DateTime.fromISO('2023-10-02T10:00:00.000+02:00'),
                id: '1256142',
                source: 'MILO',
                sousTitre: 'Pour job Plombier',
                titre: '10h00 - GJ - CV et Lettre de motivation',
                type: 'session',
                typeSession: 'info coll i-milo',
              },
              {
                date: DateTime.fromISO('2023-10-04T10:00:00.000+02:00'),
                id: '1256145',
                source: 'MILO',
                sousTitre: 'Sessions pour Amelle avec 2 L - 1',
                titre: '10h00 - GJ - CV et Lettre de motivation',
                type: 'session',
                typeSession: 'info coll i-milo',
              },
              {
                date: DateTime.fromISO('2023-10-06T10:00:00.000+02:00'),
                id: '1256147',
                source: 'MILO',
                sousTitre: 'Sessions pour Amelle avec 2 L - 3',
                titre: '10h00 - GJ - CV et Lettre de motivation',
                type: 'session',
                typeSession: 'info coll i-milo',
              },
              {
                date: DateTime.fromISO('2023-10-10T10:00:00.000+02:00'),
                id: '1256149',
                source: 'MILO',
                sousTitre: "dans le domaine de l'écologie",
                titre: '10h00 - Recrutement service civique',
                type: 'session',
                typeSession: 'info coll i-milo',
              },
              {
                date: DateTime.fromISO('2023-10-16T10:00:00.000+02:00'),
                id: '1256148',
                source: 'MILO',
                sousTitre: 'Sessions pour Amelle avec 2 L - 4',
                titre: '10h00 - GJ - CV et Lettre de motivation',
                type: 'session',
                typeSession: 'info coll i-milo',
              },
            ],
            metadata: {
              actionsEnRetard: 0,
              dateDeDebut: DateTime.fromISO('2023-10-02T00:00:00.000+02:00'),
              dateDeFin: DateTime.fromISO('2023-10-16T00:00:00.000+02:00'),
            },
          })

          // When
          await renderFicheJeuneMILO(StructureConseiller.MILO)

          // Then
          expect(
            screen.queryByText(/Sessions pour Amelle avec 2 L - 4/)
          ).not.toBeInTheDocument()
        })
      })
    })
  })
})

async function renderFicheJeuneMILO(structure: StructureConseiller) {
  await act(async () => {
    renderWithContexts(
      <FicheBeneficiairePage
        beneficiaire={unDetailBeneficiaire()}
        rdvs={[]}
        actionsInitiales={desActionsInitiales()}
        categoriesActions={desCategories()}
        onglet='AGENDA'
        lectureSeule={false}
      />,
      {
        customConseiller: { id: 'id-conseiller', structure: structure },
      }
    )
  })
}

async function renderFicheJeuneFT(
  structure: StructureConseiller,
  rdvs: EvenementListItem[] = [],
  metadonnees: MetadonneesFavoris,
  offresFT: Offre[],
  recherchesFT: Recherche[]
) {
  await act(async () => {
    renderWithContexts(
      <FicheBeneficiairePage
        beneficiaire={unDetailBeneficiaire()}
        rdvs={rdvs}
        actionsInitiales={desActionsInitiales()}
        categoriesActions={desCategories()}
        metadonneesFavoris={metadonnees}
        offresFT={offresFT}
        recherchesFT={recherchesFT}
        onglet='AGENDA'
        lectureSeule={false}
        demarches={[]}
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

import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { DateTime } from 'luxon'
import { useRouter } from 'next/navigation'
import React from 'react'

import Pilotage from 'app/(connected)/(with-sidebar)/(with-chat)/pilotage/PilotagePage'
import { desCategories, uneListeDActionsAQualifier } from 'fixtures/action'
import { ActionPilotage } from 'interfaces/action'
import {
  getActionsAQualifierClientSide,
  qualifierActions,
} from 'services/actions.service'
import getByDescriptionTerm from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'
import { ApiError } from 'utils/httpClient'

jest.mock('services/actions.service')
jest.mock('components/Modal')

describe('PilotagePage client side - Actions', () => {
  describe('contenu', () => {
    let actions: ActionPilotage[]
    let actionSansCategorie: ActionPilotage
    let container: HTMLElement

    beforeEach(async () => {
      actions = uneListeDActionsAQualifier()
      actionSansCategorie = {
        id: '009347ea-4acb-4b61-9e08-b6caf38e2812',
        titre: 'Regarder Tchoupi faire du tricycle',
        beneficiaire: {
          id: 'tchoupi',
          nom: 'Trotro',
          prenom: 'L’âne',
        },
        dateFinReelle: '16/01/2024',
      }
      ;(getActionsAQualifierClientSide as jest.Mock).mockImplementation(
        async (_, { page, tri, filtres }) => ({
          actions: [
            {
              id: `action-page-${page}-${tri}-${filtres.length}filtres`,
              titre: `Action page ${page} ${tri} ${filtres.length}filtres`,
              beneficiaire: {
                id: 'hermione',
                nom: 'Granger',
                prenom: 'Hermione',
              },
              dateFinReelle: '18/12/2022',
            },
          ],
          metadonnees: { nombrePages: 3, nombreTotal: 25 },
        })
      )
      ;(qualifierActions as jest.Mock).mockResolvedValue({
        idsActionsEnErreur: [],
      })
      ;(useRouter as jest.Mock).mockReturnValue({ replace: jest.fn() })

      await act(async () => {
        ;({ container } = renderWithContexts(
          <Pilotage
            onglet='ACTIONS'
            actions={{
              donnees: [...uneListeDActionsAQualifier(), actionSansCategorie],
              metadonnees: { nombrePages: 3, nombreTotal: 25 },
            }}
            categoriesActions={desCategories()}
            animationsCollectives={{
              donnees: [],
              metadonnees: { nombrePages: 1, nombreTotal: 0 },
            }}
          />
        ))
      })
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results).toHaveNoViolations()
    })

    it('résume les activités', async () => {
      // Then
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'Nouvelles activités'
      )
      expect(getByDescriptionTerm('Les actions')).toHaveTextContent(
        '25 À qualifier'
      )
      expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
        'Actions 25 éléments'
      )
    })

    it('affiche un tableau d’actions à qualifier ', () => {
      // Given
      const tableauDActions = screen.getByRole('table', {
        name: 'Liste des actions à qualifier',
      })

      // Then
      expect(
        within(tableauDActions).getByRole('columnheader', {
          name: 'Bénéficiaire',
        })
      ).toBeInTheDocument()
      expect(
        within(tableauDActions).getByRole('columnheader', {
          name: 'Date de réalisation',
        })
      ).toBeInTheDocument()
      expect(
        within(tableauDActions).getByRole('columnheader', {
          name: 'Titre de l’action',
        })
      ).toBeInTheDocument()
      expect(
        within(tableauDActions).getByRole('columnheader', {
          name: 'Catégorie Filtrer les actions',
        })
      ).toBeInTheDocument()
    })

    it('affiche information catégorie manquante', async () => {
      // Then
      expect(
        within(
          screen.getByRole('row', {
            name: /Regarder Tchoupi faire du tricycle/,
          })
        ).getByText('Catégorie manquante')
      ).toBeInTheDocument()
    })

    it('affiche les actions du conseiller à qualifier', async () => {
      //Given

      // Then
      actions.forEach((action) => {
        const dateFinReelle = DateTime.fromISO(action.dateFinReelle).toFormat(
          'dd MMMM yyyy',
          { locale: 'fr-FR' }
        )
        expect(screen.getByText(action.titre)).toBeInTheDocument()
        expect(screen.getByText(dateFinReelle)).toBeInTheDocument()
        expect(
          screen.getByText(
            `${action.beneficiaire.nom} ${action.beneficiaire.prenom}`
          )
        ).toBeInTheDocument()
        expect(
          screen.getByRole('link', {
            name: `Accéder au détail de l’action terminée le ${dateFinReelle} : ${action.titre}`,
          })
        ).toHaveAttribute(
          'href',
          `/mes-jeunes/${action.beneficiaire.id}/actions/${action.id}`
        )
        expect(screen.getByText(action.categorie!.libelle)).toBeInTheDocument()
      })
    })

    it('permet de trier les actions par nom du bénéficiaire par ordre alphabétique', async () => {
      //When
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Afficher la liste des bénéficiaires triée par noms de famille par ordre alphabétique',
        })
      )

      // Then
      expect(getActionsAQualifierClientSide).toHaveBeenCalledWith('1', {
        page: 1,
        tri: 'ALPHABETIQUE',
        filtres: [],
      })
      expect(
        screen.getByText('Action page 1 ALPHABETIQUE 0filtres')
      ).toBeInTheDocument()
    })

    it('permet de trier les actions par nom du bénéficiaire par ordre alphabétique inversé', async () => {
      //When
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Afficher la liste des bénéficiaires triée par noms de famille par ordre alphabétique',
        })
      )

      await userEvent.click(
        screen.getByRole('button', {
          name: 'Afficher la liste des bénéficiaires triée par noms de famille par ordre alphabétique inversé',
        })
      )

      // Then
      expect(getActionsAQualifierClientSide).toHaveBeenCalledWith('1', {
        page: 1,
        tri: 'INVERSE',
        filtres: [],
      })
      expect(
        screen.getByText('Action page 1 INVERSE 0filtres')
      ).toBeInTheDocument()
    })

    describe('filtrer les actions par catégorie', () => {
      beforeEach(async () => {
        // Given
        await userEvent.click(
          screen.getByRole('button', {
            name: 'Afficher la liste des bénéficiaires triée par noms de famille par ordre alphabétique',
          })
        )
        await userEvent.click(screen.getByLabelText('Page 2'))

        // When
        await userEvent.click(screen.getByText('Catégorie'))
        await userEvent.click(screen.getByLabelText('SNP 1'))
        await userEvent.click(screen.getByLabelText('SNP 2'))
        await userEvent.click(
          screen.getByRole('button', {
            name: 'Valider la sélection des catégories',
          })
        )
      })

      it('a11y', async () => {
        let results: AxeResults

        await act(async () => {
          results = await axe(container)
        })

        expect(results).toHaveNoViolations()
      })

      it('filtre les actions', () => {
        // Then
        expect(getActionsAQualifierClientSide).toHaveBeenCalledWith('1', {
          page: 1,
          tri: 'ALPHABETIQUE',
          filtres: ['SNP_1', 'SNP_2'],
        })
        expect(
          screen.getByText('Action page 1 ALPHABETIQUE 2filtres')
        ).toBeInTheDocument()
      })

      it('conserve les filtres de statut en changeant de page', async () => {
        // When
        await userEvent.click(screen.getByLabelText('Page 2'))

        // Then
        expect(getActionsAQualifierClientSide).toHaveBeenCalledWith('1', {
          page: 2,
          tri: 'ALPHABETIQUE',
          filtres: ['SNP_1', 'SNP_2'],
        })
        expect(
          screen.getByText('Action page 2 ALPHABETIQUE 2filtres')
        ).toBeInTheDocument()
      })
    })

    it('met à jour les actions avec la page demandée ', async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Afficher la liste des bénéficiaires triée par noms de famille par ordre alphabétique',
        })
      )
      await userEvent.click(screen.getByText('Catégorie'))
      await userEvent.click(screen.getByLabelText('SNP 1'))
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Valider la sélection des catégories',
        })
      )
      await userEvent.click(screen.getByLabelText('Page 2'))

      // Then
      expect(getActionsAQualifierClientSide).toHaveBeenCalledWith('1', {
        page: 2,
        tri: 'ALPHABETIQUE',
        filtres: ['SNP_1'],
      })
      expect(
        screen.getByText('Action page 2 ALPHABETIQUE 1filtres')
      ).toBeInTheDocument()
    })

    describe('multi-qualification', () => {
      describe('quand aucune action n’est sélectionnée', () => {
        it('invite à sélectionner une action', () => {
          expect(
            screen.getByText(
              'Sélectionnez au moins un élément ci-dessous pour commencer à qualifier'
            )
          ).toBeInTheDocument()
        })

        it('désactive la qualification', () => {
          expect(
            screen.getByRole('button', {
              name: 'Enregistrer les actions en non SNP',
            })
          ).toHaveAttribute('disabled')
          expect(
            screen.getByRole('button', {
              name: 'Qualifier les actions en SNP',
            })
          ).toHaveAttribute('disabled')
        })
      })

      describe('quand une action est sélectionnée', () => {
        beforeEach(async () => {
          await userEvent.click(
            screen.getByRole('checkbox', {
              name: `Sélection ${actions[0].titre} ${actions[0].categorie?.libelle ?? ''}`,
            })
          )
        })

        it('a11y', async () => {
          let results: AxeResults

          await act(async () => {
            results = await axe(container)
          })

          expect(results).toHaveNoViolations()
        })

        it('permet de qualifier l’action', () => {
          //Then
          expect(
            screen.getByText(
              '1 action sélectionnée. S’agit-il de SNP ou de non SNP ?'
            )
          ).toBeInTheDocument()
          expect(
            screen.getByRole('button', {
              name: 'Qualifier les actions en SNP',
            })
          ).not.toHaveAttribute('disabled')
        })

        describe('quand le conseiller qualifie en SNP', () => {
          beforeEach(async () => {
            await userEvent.click(
              screen.getByRole('button', {
                name: 'Qualifier les actions en SNP',
              })
            )
          })

          it('affiche la modale de qualification en SNP', () => {
            expect(
              screen.getByText(
                `Qualifier l’action de ${actions[0].beneficiaire.prenom} ${actions[0].beneficiaire.nom} en SNP ?`
              )
            ).toBeInTheDocument()
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
                  codeQualification: actions[0].categorie!.code,
                  idAction: actions[0].id,
                },
              ],
              true
            )
          })
        })

        describe('quand le conseiller enregisre en non SNP', () => {
          beforeEach(async () => {
            await userEvent.click(
              screen.getByRole('button', {
                name: 'Enregistrer les actions en non SNP',
              })
            )
          })

          it('affiche la modale d’enregistrement en non SNP', () => {
            expect(
              screen.getByText(
                `Enregistrer l’action de ${actions[0].beneficiaire.prenom} ${actions[0].beneficiaire.nom} en non SNP ?`
              )
            ).toBeInTheDocument()
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
              [{ codeQualification: 'NON_SNP', idAction: actions[0].id }],
              false
            )
          })
        })
      })

      describe('quand deux actions sont sélectionnées', () => {
        describe('quand une action n’a pas de catégorie', () => {
          beforeEach(async () => {
            await userEvent.click(
              screen.getByRole('checkbox', {
                name: /Sélection Regarder Tchoupi faire du tricycle/,
              })
            )
          })
          it('désactive la qualification', () => {
            expect(
              screen.getByRole('button', {
                name: 'Enregistrer les actions en non SNP',
              })
            ).toHaveAttribute('disabled')
            expect(
              screen.getByRole('button', {
                name: 'Qualifier les actions en SNP',
              })
            ).toHaveAttribute('disabled')
          })

          it('affiche un message d’erreur', () => {
            expect(
              screen.getByText(
                'Vous ne pouvez pas qualifier une ou plusieurs actions sans catégorie. Cliquez sur l’action pour pouvoir la modifier et lui ajouter une catégorie.'
              )
            ).toBeInTheDocument()
          })
        })

        describe('quand deux bénéficiaires sont sélectionnés', () => {
          beforeEach(async () => {
            await userEvent.click(
              screen.getByRole('checkbox', {
                name: /Sélection Faire du polynectar/,
              })
            )
            await userEvent.click(
              screen.getByRole('checkbox', {
                name: /Sélection Identifier des pistes de métier/,
              })
            )
          })
          it('désactive la qualification', () => {
            expect(
              screen.getByRole('button', {
                name: 'Enregistrer les actions en non SNP',
              })
            ).toHaveAttribute('disabled')
            expect(
              screen.getByRole('button', {
                name: 'Qualifier les actions en SNP',
              })
            ).toHaveAttribute('disabled')
          })

          it('affiche un message d’erreur', () => {
            expect(
              screen.getByText(
                'Vous ne pouvez pas qualifier les actions de plusieurs bénéficiaires. Sélectionnez seulement un ou une bénéficiaire.'
              )
            ).toBeInTheDocument()
          })
        })
      })

      describe('quand milo est down', () => {
        beforeEach(async () => {
          ;(qualifierActions as jest.Mock).mockResolvedValue(
            new ApiError(500, 'internal server error')
          )

          await userEvent.click(
            screen.getByRole('checkbox', {
              name: `Sélection ${actions[0].titre} ${actions[0].categorie?.libelle ?? ''}`,
            })
          )
        })

        it('affiche le message d’error customisé', async () => {
          //when
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

          //then
          expect(
            screen.getByText(
              'Suite à un problème inconnu la qualification a échoué. Vous pouvez réessayer.'
            )
          ).toBeInTheDocument()
        })

        it('affiche un message d’erreur quand des actions ne sont pas qualifiées', async () => {
          //when
          ;(qualifierActions as jest.Mock).mockResolvedValue({
            idsActionsEnErreur: [1, 2],
          })
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
          expect(
            screen.getByText(
              'Suite à un problème inconnu la qualification a échoué. Vous pouvez réessayer.'
            )
          ).toBeInTheDocument()
        })
      })
    })
  })

  describe("quand le conseiller n'a pas d'action à qualifier", () => {
    it('affiche un message qui le précise', async () => {
      // When
      renderWithContexts(
        <Pilotage
          onglet='ACTIONS'
          actions={{
            donnees: [],
            metadonnees: { nombrePages: 0, nombreTotal: 0 },
          }}
          categoriesActions={desCategories()}
          animationsCollectives={{
            donnees: [],
            metadonnees: { nombrePages: 0, nombreTotal: 0 },
          }}
        />
      )

      // Then
      expect(
        screen.getByText('Vous n’avez pas d’action à qualifier.')
      ).toBeInTheDocument()
    })
  })
})

import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import React from 'react'

import EtablissementPage from 'app/(connected)/(with-sidebar)/(with-chat)/etablissement/EtablissementPage'
import { uneListeDAgencesMILO } from 'fixtures/referentiel'
import {
  BeneficiaireEtablissement,
  CategorieSituation,
} from 'interfaces/beneficiaire'
import { Agence } from 'interfaces/referentiel'
import { structureMilo } from 'interfaces/structure'
import { rechercheBeneficiairesDeLEtablissement } from 'services/beneficiaires.service'
import { modifierAgence } from 'services/conseiller.service'
import { getMissionsLocalesClientSide } from 'services/referentiel.service'
import renderWithContexts from 'tests/renderWithContexts'
import { toRelativeDateTime } from 'utils/date'

jest.mock('services/beneficiaires.service')
jest.mock('services/referentiel.service')
jest.mock('services/conseiller.service')
jest.mock('components/ModalContainer')
jest.mock('components/PageActionsPortal')

describe('EtablissementPage client side', () => {
  let container: HTMLElement
  const unBeneficiaire = (page: number): BeneficiaireEtablissement => ({
    base: {
      id: 'id-jeune',
      nom: 'Page ' + page,
      prenom: 'Albert',
    },
    referent: {
      id: 'id-conseiller-1',
      nom: 'Le Calamar',
      prenom: 'Carlo',
    },
    situation: CategorieSituation.EMPLOI,
    dateDerniereActivite: '2023-03-01T14:11:38.040Z',
  })
  beforeEach(async () => {
    ;(rechercheBeneficiairesDeLEtablissement as jest.Mock).mockImplementation(
      async (_idEtablissement, _recherche, page: number) => ({
        beneficiaires: [unBeneficiaire(page)],
        metadonnees: { nombrePages: 4, nombreTotal: 37 },
      })
    )
  })

  describe('Render', () => {
    describe('quand le conseiller est superviseur', () => {
      beforeEach(async () => {
        ;({ container } = await renderWithContexts(<EtablissementPage />, {
          customConseiller: {
            structure: structureMilo,
            agence: { nom: 'Mission Locale Aubenas', id: 'id-etablissement' },
            estSuperviseur: true,
          },
        }))
      })

      it('a11y', async () => {
        let results: AxeResults

        await act(async () => {
          results = await axe(container)
        })

        expect(results!).toHaveNoViolations()
      })

      it('affiche un lien vers la page de réaffectation', () => {
        // Then
        expect(
          screen.getByRole('link', {
            name: 'Réaffecter des bénéficiaires',
          })
        ).toHaveAttribute('href', '/reaffectation')
      })
    })

    describe('quand le conseiller n’est pas superviseur', () => {
      beforeEach(async () => {
        ;({ container } = await renderWithContexts(<EtablissementPage />, {
          customConseiller: {
            structure: structureMilo,
            agence: { nom: 'Mission Locale Aubenas', id: 'id-etablissement' },
          },
        }))
      })

      it('a11y', async () => {
        let results: AxeResults

        await act(async () => {
          results = await axe(container)
        })

        expect(results!).toHaveNoViolations()
      })

      it('affiche un champ de recherche', () => {
        // Then
        expect(
          screen.getByLabelText(
            /Rechercher un bénéficiaire par son nom ou prénom/
          )
        ).toBeInTheDocument()
        expect(
          screen.getByRole('button', {
            name: 'Rechercher',
          })
        ).toBeInTheDocument()
      })

      describe('recherche', () => {
        beforeEach(async () => {
          const inputRechercheBeneficiaire = screen.getByLabelText(
            /Rechercher un bénéficiaire par son nom ou prénom/
          )
          const buttonRechercheBeneficiaire = screen.getByRole('button', {
            name: 'Rechercher',
          })

          // When
          await userEvent.type(inputRechercheBeneficiaire, 'am')
          await userEvent.click(buttonRechercheBeneficiaire)
        })

        it('lance une recherche parmis les bénéficiaires de la Mission Locale', async () => {
          // Then
          expect(rechercheBeneficiairesDeLEtablissement).toHaveBeenCalledWith(
            'id-etablissement',
            'am',
            1
          )
        })

        it('affiche le resultat de la recherche dans un tableau', async () => {
          // Then
          const tableauDeBeneficiaires = screen.getByRole('table', {
            name: 'Résultat de recherche (1 éléments)',
          })
          await waitFor(() => {
            expect(tableauDeBeneficiaires).toBeInTheDocument()
          })
          expect(
            within(tableauDeBeneficiaires).getByRole('columnheader', {
              name: 'Bénéficiaire',
            })
          ).toBeInTheDocument()
          expect(
            within(tableauDeBeneficiaires).getByRole('columnheader', {
              name: 'Situation',
            })
          ).toBeInTheDocument()
          expect(
            within(tableauDeBeneficiaires).getByRole('columnheader', {
              name: 'Dernière activité',
            })
          ).toBeInTheDocument()
          expect(
            within(tableauDeBeneficiaires).getByRole('columnheader', {
              name: 'Conseiller',
            })
          ).toBeInTheDocument()
          expect(
            screen.getByRole('link', {
              name: 'Accéder à la fiche de Page 1 Albert Emploi Le 01/03/2023 à 15:11 Carlo Le Calamar',
            })
          ).toHaveAttribute('href', '/etablissement/beneficiaires/id-jeune')
          expect(
            within(tableauDeBeneficiaires).getByText(`Page 1 Albert`)
          ).toBeInTheDocument()
          expect(
            within(tableauDeBeneficiaires).getByText('Emploi')
          ).toBeInTheDocument()
          expect(
            within(tableauDeBeneficiaires).getByText(
              toRelativeDateTime('2023-03-01T14:11:38.040Z')
            )
          ).toBeInTheDocument()
          expect(
            within(tableauDeBeneficiaires).getByText(`Carlo Le Calamar`)
          ).toBeInTheDocument()
        })

        it('ne déclenche pas de recherche quand on vide le champ', async () => {
          // When
          await userEvent.click(
            screen.getByRole('button', { name: 'Effacer le champ de saisie' })
          )

          // Then
          expect(rechercheBeneficiairesDeLEtablissement).toHaveBeenCalledTimes(
            1
          )
          expect(
            screen.queryByText(/Résultat de recherche/)
          ).not.toBeInTheDocument()
        })

        describe('pagination', () => {
          it('récupère la page demandée', async () => {
            // When
            await userEvent.click(
              screen.getByRole('button', { name: 'Page 3' })
            )

            // Then
            expect(rechercheBeneficiairesDeLEtablissement).toHaveBeenCalledWith(
              'id-etablissement',
              'am',
              3
            )
            expect(screen.getByText('Page 3 Albert')).toBeInTheDocument()
          })

          it('met à jour la page courante', async () => {
            // When
            await userEvent.click(screen.getByLabelText('Page suivante'))
            await userEvent.click(screen.getByLabelText('Page suivante'))

            // Then
            expect(rechercheBeneficiairesDeLEtablissement).toHaveBeenCalledWith(
              'id-etablissement',
              'am',
              2
            )
            expect(rechercheBeneficiairesDeLEtablissement).toHaveBeenCalledWith(
              'id-etablissement',
              'am',
              3
            )

            expect(screen.getByLabelText(`Page 3`)).toHaveAttribute(
              'aria-current',
              'page'
            )
          })

          it('ne recharge pas la page courante', async () => {
            // When
            await userEvent.click(screen.getByLabelText(`Page 1`))

            // Then
            expect(
              rechercheBeneficiairesDeLEtablissement
            ).toHaveBeenCalledTimes(1)
          })
        })
      })

      it(`prévient qu'il n'y a pas de résultat`, async () => {
        // Given
        const inputRechercheBeneficiaire = screen.getByLabelText(
          /Rechercher un bénéficiaire par son nom ou prénom/
        )
        const buttonRechercheBeneficiaire = screen.getByRole('button', {
          name: 'Rechercher',
        })

        ;(
          rechercheBeneficiairesDeLEtablissement as jest.Mock
        ).mockResolvedValue({
          beneficiaires: [],
          metadonnes: { nombrePages: 0, nombreTotal: 0 },
        })

        // When
        await userEvent.type(inputRechercheBeneficiaire, 'am')
        await userEvent.click(buttonRechercheBeneficiaire)

        // Then
        expect(
          screen.getByText('Aucun bénéficiaire trouvé.')
        ).toBeInTheDocument()
      })

      it(`prévient qu'il faut saisir au moins 2 caractères`, async () => {
        // Given
        const inputRechercheBeneficiaire = screen.getByLabelText(
          /Rechercher un bénéficiaire par son nom ou prénom/
        )
        const buttonRechercheBeneficiaire = screen.getByRole('button', {
          name: 'Rechercher',
        })

        // When
        await userEvent.type(inputRechercheBeneficiaire, 'z')
        await userEvent.click(buttonRechercheBeneficiaire)

        // Then
        expect(rechercheBeneficiairesDeLEtablissement).toHaveBeenCalledTimes(0)
        expect(
          screen.getByText('Veuillez saisir au moins 2 caractères')
        ).toBeInTheDocument()
      })
    })
  })

  describe('quand le conseiller n’a pas d’établissement', () => {
    let agences: Agence[]

    beforeEach(async () => {
      agences = uneListeDAgencesMILO()
      ;(getMissionsLocalesClientSide as jest.Mock).mockResolvedValue(agences)

      // When
      ;({ container } = await renderWithContexts(<EtablissementPage />, {
        customConseiller: { structure: structureMilo },
      }))
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
    })

    it('n’affiche pas le champs de recherche', async () => {
      // Then
      expect(
        screen.queryByRole('search', {
          name: 'Rechercher un bénéficiaire par son nom ou prénom',
        })
      ).not.toBeInTheDocument()
    })

    it('demande de renseigner son agence', async () => {
      // Then
      expect(
        screen.getByText(/Votre Mission Locale n’est pas renseignée/)
      ).toBeInTheDocument()

      expect(
        screen.getByRole('button', {
          name: 'Renseigner votre Mission Locale',
        })
      ).toBeInTheDocument()
    })

    it('permet de renseigner son agence', async () => {
      // When
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Renseigner votre Mission Locale',
        })
      )

      // Then
      expect(getMissionsLocalesClientSide).toHaveBeenCalledWith()
      expect(
        screen.getByRole('combobox', { name: /votre Mission Locale/ })
      ).toBeInTheDocument()
      agences.forEach((agence) =>
        expect(
          screen.getByRole('option', { hidden: true, name: agence.nom })
        ).toBeInTheDocument()
      )
    })

    it('sauvegarde l’agence et affiche la barre de recherche', async () => {
      // Given
      await userEvent.click(
        screen.getByRole('button', {
          name: 'Renseigner votre Mission Locale',
        })
      )
      const agence = agences[2]
      const searchAgence = screen.getByRole('combobox', {
        name: /votre Mission Locale/,
      })
      const submit = screen.getByRole('button', { name: 'Ajouter' })

      // When
      await userEvent.selectOptions(searchAgence, agence.nom)
      await userEvent.click(submit)

      // Then
      expect(modifierAgence).toHaveBeenCalledWith({
        id: agence.id,
        nom: agence.nom,
        codeDepartement: '3',
      })
      expect(() =>
        screen.getByText('Votre Mission Locale n’est pas renseignée')
      ).toThrow()

      expect(
        screen.getByRole('textbox', {
          name: 'Rechercher un bénéficiaire par son nom ou prénom',
        })
      ).toBeInTheDocument()
    })
  })
})

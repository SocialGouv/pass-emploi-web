import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import { DateTime } from 'luxon'
import { usePathname } from 'next/navigation'
import React from 'react'

import InformationsPage from 'app/(connected)/(with-sidebar)/(with-chat)/mes-jeunes/[idJeune]/informations/InformationsPage'
import { unAgenda } from 'fixtures/agenda'
import {
  desConseillersBeneficiaire,
  desIndicateursSemaine,
  unDetailBeneficiaire,
  uneMetadonneeFavoris,
} from 'fixtures/beneficiaire'
import {
  CategorieSituation,
  ConseillerHistorique,
  DetailBeneficiaire,
  EtatSituation,
} from 'interfaces/beneficiaire'
import { Structure, structureFTCej, structureMilo } from 'interfaces/structure'
import { recupererAgenda } from 'services/agenda.service'
import {
  getIndicateursBeneficiaire,
  modifierDispositif,
} from 'services/beneficiaires.service'
import getByDescriptionTerm, { getByTextContent } from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/beneficiaires.service')
jest.mock('services/agenda.service')
jest.mock('components/ModalContainer')

describe('InformationsPage client side', () => {
  let container: HTMLElement
  const listeSituations = [
    {
      etat: EtatSituation.EN_COURS,
      categorie: CategorieSituation.EMPLOI,
    },
    {
      etat: EtatSituation.PREVU,
      categorie: CategorieSituation.CONTRAT_EN_ALTERNANCE,
    },
  ]
  const listeConseillers = desConseillersBeneficiaire()
  const jeune = unDetailBeneficiaire({ urlDossier: 'https://dossier-milo.fr' })

  beforeEach(async () => {
    ;(recupererAgenda as jest.Mock).mockResolvedValue(unAgenda())
    ;(usePathname as jest.Mock).mockReturnValue('/mes-jeunes')
  })

  describe('quand l’utilisateur est un conseiller Mission Locale', () => {
    describe('pour les Informations', () => {
      beforeEach(async () => {
        // Given
        container = await renderPage(listeSituations, [], structureMilo, jeune)
      })

      it('a11y', async () => {
        let results: AxeResults

        await act(async () => {
          results = await axe(container)
        })

        expect(results!).toHaveNoViolations()
      })

      it('affiche l’onglet sélectionné', () => {
        // Then
        expect(
          screen.getByRole('tab', { selected: true })
        ).toHaveAccessibleName('Informations')
      })

      it('affiche les informations du bénéficiaires', () => {
        //Then
        expect(
          screen.getByRole('heading', { level: 2, name: 'Bénéficiaire' })
        ).toBeInTheDocument()
        expect(
          screen.getByRole('link', {
            name: 'Dossier jeune i-milo (nouvelle fenêtre)',
          })
        ).toHaveAttribute('href', 'https://dossier-milo.fr')
        expect(getByDescriptionTerm('Dispositif :')).toHaveTextContent('CEJ')
        expect(getByDescriptionTerm('Email :')).toHaveTextContent(
          'kenji.jirac@email.fr'
        )
        expect(getByDescriptionTerm('Ajouté le :')).toHaveTextContent(
          '7 décembre 2021'
        )
        expect(getByDescriptionTerm('Date de fin du CEJ :')).toHaveTextContent(
          '-- information non disponible'
        )
      })

      describe('changement de dispositif', () => {
        beforeEach(async () => {
          // When
          await userEvent.click(
            screen.getByRole('button', {
              name: 'Changer le bénéficiaire de dispositif',
            })
          )
        })

        it('informe de l’usage attendu', async () => {
          // Then
          expect(
            screen.getByText(
              'Confirmation du changement de dispositif (passage en PACEA)'
            )
          ).toBeInTheDocument()
          expect(
            screen.getByText(
              'Attention, cette modification ne doit être utilisée que pour corriger une erreur dans le choix du dispositif lors de la création du compte.'
            )
          ).toBeInTheDocument()
        })

        it('oblige la validation de l’usage', async () => {
          // When
          await userEvent.click(
            screen.getByRole('button', {
              name: 'Confirmer le passage du bénéficiaire en PACEA',
            })
          )

          // Then
          expect(
            screen.getByText('Cet élément est obligatoire.')
          ).toBeInTheDocument()
          expect(modifierDispositif).not.toHaveBeenCalled()
          expect(getByDescriptionTerm('Dispositif :')).toHaveTextContent('CEJ')
        })

        it('permet de changer le dispositif du bénéficiaire', async () => {
          // When
          await userEvent.click(
            screen.getByRole('checkbox', {
              name: 'Je confirme que le passage en PACEA de ce bénéficiaire est lié à une erreur lors de la création du compte (obligatoire)',
            })
          )
          await userEvent.click(
            screen.getByRole('button', {
              name: 'Confirmer le passage du bénéficiaire en PACEA',
            })
          )

          // Then
          expect(modifierDispositif).toHaveBeenCalledWith(
            'beneficiaire-1',
            'PACEA'
          )
          expect(() =>
            screen.getByText(/Confirmation du changement de dispositif/)
          ).toThrow()
          expect(getByDescriptionTerm('Dispositif :')).toHaveTextContent(
            'PACEA'
          )
        })
      })

      it('affiche les situations du bénéficiaire', async () => {
        // Then
        expect(
          screen.getByRole('heading', {
            level: 2,
            name: 'Historique situations',
          })
        ).toBeInTheDocument()

        expect(screen.getByText('Emploi')).toBeInTheDocument()
        expect(screen.getByText('en cours')).toBeInTheDocument()
        expect(screen.getByText('Contrat en Alternance')).toBeInTheDocument()
        expect(screen.getByText('prévue')).toBeInTheDocument()
      })
    })

    describe('pour l’indicateur des conseillers', () => {
      beforeEach(async () => {
        //Given
        container = await renderPage([], [], structureMilo, jeune)

        // When
        const tabIndicateurs = screen.getByRole('tab', {
          name: 'Indicateurs',
        })
        await userEvent.click(tabIndicateurs)
      })

      it('a11y', async () => {
        let results: AxeResults

        await act(async () => {
          results = await axe(container)
        })

        expect(results!).toHaveNoViolations()
      })

      it('affiche un onglet dédié', async () => {
        //Then
        expect(
          screen.getByRole('tab', { selected: true })
        ).toHaveAccessibleName('Indicateurs')
        expect(
          screen.getByText('Semaine du 29/08/2022 au 04/09/2022')
        ).toBeInTheDocument()
      })

      it('affiche les indicateurs des actions', async () => {
        const indicateursActions = screen.getByRole('heading', {
          name: 'Les actions',
        }).parentElement
        //Then
        expect(
          getByTextContent('0Créées', indicateursActions!)
        ).toBeInTheDocument()
        expect(
          getByTextContent('1Terminée', indicateursActions!)
        ).toBeInTheDocument()
        expect(
          getByTextContent('2En retard', indicateursActions!)
        ).toBeInTheDocument()
        expect(
          screen.getByRole('link', { name: 'Voir toutes les actions' })
        ).toHaveAttribute('href', '/mes-jeunes/id?onglet=actions')
      })

      it('affiche l’indicateur de rendez-vous', async () => {
        const indicateursRdv = screen.getByRole('heading', {
          name: 'Les événements',
        }).parentElement
        //Then
        expect(
          getByTextContent('3Cette semaine', indicateursRdv!)
        ).toBeInTheDocument()
      })
      it('affiche les indicateurs des offres', async () => {
        //Then
        const indicateursOffres = screen.getByRole('heading', {
          name: 'Les offres',
        }).parentElement
        expect(
          getByTextContent('10Offres consultées', indicateursOffres!)
        ).toBeInTheDocument()
        expect(
          getByTextContent('4Offres partagées', indicateursOffres!)
        ).toBeInTheDocument()
        expect(
          getByTextContent('6Favoris ajoutés', indicateursOffres!)
        ).toBeInTheDocument()
        expect(
          getByTextContent('7Recherches sauvegardées', indicateursOffres!)
        ).toBeInTheDocument()

        expect(
          screen.getByRole('link', { name: 'Voir tous les favoris' })
        ).toHaveAttribute('href', '/mes-jeunes/id/favoris')
      })
    })

    describe('pour l’Historique des conseillers', () => {
      describe('affiche un onglet dédié', () => {
        beforeEach(async () => {
          // Given
          container = await renderPage([], [], structureMilo, jeune)

          // When
          const tabConseillers = screen.getByRole('tab', {
            name: 'Historique des conseillers',
          })
          await userEvent.click(tabConseillers)
        })

        it('a11y', async () => {
          let results: AxeResults

          await act(async () => {
            results = await axe(container)
          })

          expect(results!).toHaveNoViolations()
        })

        it('contenu', () => {
          // Then
          expect(
            screen.getByRole('tab', { selected: true })
          ).toHaveAccessibleName('Historique des conseillers')
        })
      })

      describe('affiche la liste complète des conseillers du jeune', () => {
        beforeEach(async () => {
          //Given
          container = await renderPage(
            [],
            listeConseillers,
            structureMilo,
            jeune
          )

          // When
          const tabConseillers = screen.getByRole('tab', {
            name: 'Historique des conseillers',
          })
          await userEvent.click(tabConseillers)
        })

        it('a11y', async () => {
          let results: AxeResults

          await act(async () => {
            results = await axe(container)
          })

          expect(results!).toHaveNoViolations()
        })

        it('contenu', () => {
          //Then
          listeConseillers.forEach(({ nom, prenom }: ConseillerHistorique) => {
            expect(screen.getByText(`${nom} ${prenom}`)).toBeInTheDocument()
          })
        })
      })
    })
  })

  describe('quand l’utilisateur est un conseiller France Travail', () => {
    beforeEach(async () => {
      // Given
      container = await renderPage([], [], structureFTCej, jeune)
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(container)
      })

      expect(results!).toHaveNoViolations()
    })

    it('n’affiche pas l’onglet Indicateurs', async () => {
      // Then
      expect(() => screen.getByText('Indicateurs')).toThrow()
      expect(
        screen.getByRole('tab', { name: 'Historique des conseillers' })
      ).toBeInTheDocument()
      expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName(
        'Informations'
      )
    })
  })
})

async function renderPage(
  situations: Array<{
    etat?: EtatSituation
    categorie: CategorieSituation
    dateFin?: string
  }>,
  conseillers: ConseillerHistorique[],
  structure: Structure,
  beneficiaire: DetailBeneficiaire
): Promise<HTMLElement> {
  const SEPTEMBRE_1 = DateTime.fromISO('2022-09-01T14:00:00.000+02:00')
  jest.spyOn(DateTime, 'now').mockReturnValue(SEPTEMBRE_1)
  ;(getIndicateursBeneficiaire as jest.Mock).mockResolvedValue(
    desIndicateursSemaine()
  )

  const { container } = await renderWithContexts(
    <InformationsPage
      idBeneficiaire={'id'}
      situations={situations}
      conseillers={conseillers}
      lectureSeule={false}
      beneficiaire={beneficiaire}
      metadonneesFavoris={uneMetadonneeFavoris()}
      onglet={'INFORMATIONS'}
    />,
    { customConseiller: { structure: structure } }
  )

  return container
}

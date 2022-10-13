import { act, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import { GetServerSidePropsContext } from 'next/types'

import {
  listeBaseOffresEmploi,
  listeBaseServicesCiviques,
} from 'fixtures/offre'
import { desCommunes, desLocalites } from 'fixtures/referentiel'
import {
  mockedOffresEmploiService,
  mockedReferentielService,
  mockedServicesCiviquesService,
} from 'fixtures/services'
import { BaseOffreEmploi, BaseServiceCivique } from 'interfaces/offre'
import { Localite } from 'interfaces/referentiel'
import RechercheOffres, { getServerSideProps } from 'pages/recherche-offres'
import { domainesServiceCivique } from 'referentiel/domaines-service-civique'
import { OffresEmploiService } from 'services/offres-emploi.service'
import { ReferentielService } from 'services/referentiel.service'
import { ServicesCiviquesService } from 'services/services-civiques.service'
import { getByTextContent } from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'

jest.mock('utils/auth/withMandatorySessionOrRedirect')

describe('Page Recherche Offres', () => {
  describe('client side', () => {
    let offresEmploiService: OffresEmploiService
    let servicesCiviquesService: ServicesCiviquesService
    let referentielService: ReferentielService

    let offresEmploi: BaseOffreEmploi[]
    let servicesCiviques: BaseServiceCivique[]
    let localites: Localite[]
    let communes: Localite[]
    beforeEach(() => {
      localites = desLocalites()
      communes = desCommunes()
      offresEmploi = listeBaseOffresEmploi()
      servicesCiviques = listeBaseServicesCiviques()
      offresEmploiService = mockedOffresEmploiService({
        searchOffresEmploi: jest.fn().mockResolvedValue(offresEmploi),
      })
      referentielService = mockedReferentielService({
        getCommunesEtDepartements: jest.fn().mockResolvedValue(desLocalites()),
        getCommunes: jest.fn().mockResolvedValue(desCommunes()),
      })
      servicesCiviquesService = mockedServicesCiviquesService({
        searchServicesCiviques: jest.fn().mockResolvedValue(servicesCiviques),
      })

      renderWithContexts(<RechercheOffres pageTitle='' />, {
        customDependances: {
          offresEmploiService,
          referentielService,
          servicesCiviquesService,
        },
      })
    })

    it('nécessite de selectionner un type d’offre', () => {
      // Then
      const etape1 = screen.getByRole('group', {
        name: 'Étape 1 Sélectionner un type d’offre',
      })
      expect(etape1).toBeInTheDocument()
      expect(
        within(etape1).getByRole('radio', { name: 'Offre d’emploi' })
      ).not.toHaveAttribute('disabled')
      expect(
        within(etape1).getByRole('radio', { name: 'Service civique' })
      ).not.toHaveAttribute('disabled')

      expect(() => screen.getByRole('group', { name: /Étape 2/ })).toThrow()
      expect(() => screen.getByRole('button', { name: 'Rechercher' })).toThrow()
    })

    describe('type offre : emploi', () => {
      beforeEach(async () => {
        await userEvent.click(
          screen.getByRole('radio', { name: 'Offre d’emploi' })
        )
      })

      it('permet de definir des critères de recherche', () => {
        // Then
        const etape2 = screen.getByRole('group', {
          name: 'Étape 2 Critères de recherche',
        })

        expect(etape2).toBeInTheDocument()
        expect(
          within(etape2).getByLabelText('Mots clés (Métier, code ROME)')
        ).toHaveAttribute('type', 'text')
        expect(
          within(etape2).getByRole('combobox', {
            name: 'Lieu de travail Saisissez une ville ou un département',
          })
        ).toBeInTheDocument()
        expect(() =>
          within(etape2).getAllByRole('option', { hidden: true })
        ).toThrow()
      })

      describe('autocomplétion localisation', () => {
        it('retire les accents à la saisie', async () => {
          // Given
          const inputLocalisation = screen.getByLabelText(/Lieu de travail/)

          // When
          await saisirLocalite(/Lieu de travail/, 'Ardèche')

          // Then
          expect(inputLocalisation).toHaveValue('Ardeche')
          expect(
            referentielService.getCommunesEtDepartements
          ).toHaveBeenCalledTimes(1)
          expect(
            referentielService.getCommunesEtDepartements
          ).toHaveBeenCalledWith('Ardeche')
        })

        it('récupère les communes et les départements à la saisie', async () => {
          // When
          await saisirLocalite(/Lieu de travail/, 'Paris')

          // Then
          expect(
            referentielService.getCommunesEtDepartements
          ).toHaveBeenCalledTimes(1)
          expect(
            referentielService.getCommunesEtDepartements
          ).toHaveBeenCalledWith('Paris')
          expect(screen.getAllByRole('option', { hidden: true })).toHaveLength(
            localites.length
          )
          localites.forEach((localite) => {
            expect(
              screen.getByRole('option', {
                hidden: true,
                name: localite.libelle,
              })
            ).toHaveValue(localite.libelle)
          })
        })

        it('affiche une erreur quand la localisation est incorrecte', async () => {
          // Given
          const inputLocalisation = screen.getByLabelText(/Lieu de travail/)
          const submitButton = screen.getByRole('button', {
            name: 'Rechercher',
          })

          // When
          await userEvent.type(inputLocalisation, 'paris14')

          await act(() => {
            fireEvent.blur(inputLocalisation)
          })
          await userEvent.click(submitButton)

          // Then
          expect(
            screen.getByText('Veuillez saisir une localisation correcte.')
          ).toBeInTheDocument()
          expect(offresEmploiService.searchOffresEmploi).toHaveBeenCalledTimes(
            0
          )
        })
      })

      describe('permet d’affiner la recherche par des filtres', () => {
        it('permet d’ajouter plus de filtre à notre recherche', async () => {
          // Then
          expect(() =>
            screen.getByRole('group', { name: 'Étape 3 Plus de critères' })
          ).toThrow()
          expect(
            screen.getByRole('button', { name: 'Voir plus de critères' })
          ).toBeInTheDocument()

          // When
          await userEvent.click(screen.getByText('Voir plus de critères'))

          // Then
          const etape3 = screen.getByRole('group', {
            name: 'Étape 3 Plus de critères',
          })
          expect(etape3).toBeInTheDocument()
          expect(screen.getByText('Voir moins de critères')).toBeInTheDocument()
        })

        it('permet de selectionner un ou plusieurs types de contrat', async () => {
          // When
          await userEvent.click(screen.getByText('Voir plus de critères'))

          // Then
          const etape3 = screen.getByRole('group', {
            name: 'Étape 3 Plus de critères',
          })
          const typeContratGroup = within(etape3).getByRole('group', {
            name: 'Type de contrat',
          })
          expect(typeContratGroup).toBeInTheDocument()
          expect(
            within(typeContratGroup).getByRole('checkbox', { name: 'CDI' })
          ).toBeInTheDocument()
          expect(
            within(typeContratGroup).getByRole('checkbox', {
              name: 'CDD - intérim - saisonnier',
            })
          ).toBeInTheDocument()
          expect(
            within(typeContratGroup).getByRole('checkbox', { name: 'Autres' })
          ).toBeInTheDocument()
        })

        it('permet de selectionner un ou plusieurs temps de travail', async () => {
          // When
          await userEvent.click(screen.getByText('Voir plus de critères'))

          // Then
          const etape3 = screen.getByRole('group', {
            name: 'Étape 3 Plus de critères',
          })
          const tempsTravailGroup = within(etape3).getByRole('group', {
            name: 'Temps de travail',
          })
          expect(tempsTravailGroup).toBeInTheDocument()
          expect(
            within(tempsTravailGroup).getByRole('checkbox', {
              name: 'Temps partiel',
            })
          ).toBeInTheDocument()
          expect(
            within(tempsTravailGroup).getByRole('checkbox', {
              name: 'Temps plein',
            })
          ).toBeInTheDocument()
        })

        it("permet d'afficher uniquement les offres débutant accepté", async () => {
          // When
          await userEvent.click(screen.getByText('Voir plus de critères'))

          // Then
          const etape3 = screen.getByRole('group', {
            name: 'Étape 3 Plus de critères',
          })
          const experienceGroup = within(etape3).getByRole('group', {
            name: 'Expérience',
          })
          expect(
            within(experienceGroup).getByRole('checkbox', {
              name: /Afficher uniquement les offres débutant accepté/,
            })
          ).not.toBeChecked()
        })

        it('permet de définir un rayon de recherche si une commune est sélectionnée', async () => {
          // When
          await userEvent.click(screen.getByText('Voir plus de critères'))
          const etape3 = screen.getByRole('group', {
            name: 'Étape 3 Plus de critères',
          })
          expect(() =>
            within(etape3).getByRole('group', { name: 'Distance' })
          ).toThrow()

          await saisirLocalite(/Lieu de travail/, 'paris 14')

          // Then
          const distanceGroup = within(etape3).getByRole('group', {
            name: 'Distance',
          })
          const inputRange = within(distanceGroup).getByRole('slider', {
            name: 'Dans un rayon de : 10km',
          })
          expect(inputRange).toHaveAttribute('value', '10')
          expect(inputRange).toHaveAttribute('type', 'range')
          expect(inputRange).toHaveAttribute('min', '0')
          expect(inputRange).toHaveAttribute('max', '100')
        })

        it("retiens les critères d'affinage saisie", async () => {
          // Given
          await userEvent.click(screen.getByText('Voir plus de critères'))

          // When-Then
          await userEvent.click(
            screen.getByLabelText(
              /Afficher uniquement les offres débutant accepté/
            )
          )
          expect(
            screen.getByText('[1] critère sélectionné')
          ).toBeInTheDocument()

          await userEvent.click(screen.getByLabelText('CDI'))
          await userEvent.click(screen.getByLabelText(/CDD/))
          expect(
            screen.getByText('[2] critères sélectionnés')
          ).toBeInTheDocument()

          await userEvent.click(screen.getByLabelText('Temps plein'))
          expect(
            screen.getByText('[3] critères sélectionnés')
          ).toBeInTheDocument()

          await saisirLocalite(/Lieu de travail/, 'paris 14')
          fireEvent.change(screen.getByLabelText(/Dans un rayon de/), {
            target: { value: 43 },
          })
          expect(
            getByTextContent('Dans un rayon de : 43km')
          ).toBeInTheDocument()
          expect(
            screen.getByText('[4] critères sélectionnés')
          ).toBeInTheDocument()

          // When
          await userEvent.click(screen.getByText('Voir moins de critères'))
          await userEvent.click(screen.getByText('Voir plus de critères'))

          // Then
          expect(screen.getByLabelText(/débutant accepté/)).toBeChecked()
          expect(screen.getByLabelText(/CDI/)).toBeChecked()
          expect(screen.getByLabelText(/CDD/)).toBeChecked()
          expect(screen.getByLabelText(/Temps plein/)).toBeChecked()
          expect(screen.getByLabelText(/rayon/)).toHaveValue('43')
        })
      })

      describe('recherche', () => {
        it("permet de rechercher des offres d'emploi", async () => {
          // Given
          const submitButton = screen.getByRole('button', {
            name: 'Rechercher',
          })

          // When
          await userEvent.click(submitButton)

          // Then
          expect(offresEmploiService.searchOffresEmploi).toHaveBeenCalledWith(
            {}
          )
        })

        it('construit la recherche avec un département', async () => {
          // Given
          const inputMotsCles = screen.getByLabelText(/Mots clés/)
          const submitButton = screen.getByRole('button', {
            name: 'Rechercher',
          })

          // When
          await userEvent.type(inputMotsCles, 'prof industrie')
          await saisirLocalite(/Lieu de travail/, 'pAris')
          await userEvent.click(submitButton)

          // Then
          expect(offresEmploiService.searchOffresEmploi).toHaveBeenCalledWith({
            motsCles: 'prof industrie',
            departement: '75',
          })
        })

        it('construit la recherche avec une commune', async () => {
          // Given
          const inputMotsCles = screen.getByLabelText(/Mots clés/)
          const submitButton = screen.getByRole('button', {
            name: 'Rechercher',
          })

          // When
          await userEvent.type(inputMotsCles, 'prof industrie')
          await saisirLocalite(/Lieu de travail/, 'paris 14')
          await userEvent.click(submitButton)

          // Then
          expect(offresEmploiService.searchOffresEmploi).toHaveBeenCalledWith({
            motsCles: 'prof industrie',
            commune: '75114',
            rayon: 10,
          })
        })

        it('construit la recherche avec les critères d’affinage', async () => {
          // Given
          await saisirLocalite(/Lieu de travail/, 'paris 14')
          await userEvent.click(screen.getByText('Voir plus de critères'))

          await userEvent.click(
            screen.getByLabelText(
              /Afficher uniquement les offres débutant accepté/
            )
          )

          await userEvent.click(screen.getByLabelText('CDI'))
          await userEvent.click(screen.getByLabelText(/CDD/))
          await userEvent.click(screen.getByLabelText('Autres'))
          await userEvent.click(screen.getByLabelText('Autres'))

          await userEvent.click(screen.getByLabelText('Temps plein'))
          await userEvent.click(screen.getByLabelText('Temps partiel'))
          await userEvent.click(screen.getByLabelText('Temps partiel'))

          fireEvent.change(screen.getByLabelText(/Dans un rayon de/), {
            target: { value: 43 },
          })

          // When
          await userEvent.click(
            screen.getByRole('button', { name: 'Rechercher' })
          )

          // Then
          expect(offresEmploiService.searchOffresEmploi).toHaveBeenCalledWith({
            commune: '75114',
            debutantAccepte: true,
            typesContrats: ['CDI', 'CDD-interim-saisonnier'],
            durees: ['Temps plein'],
            rayon: 43,
          })
        })
      })

      describe('recherche réussie', () => {
        let offresList: HTMLElement
        beforeEach(async () => {
          // Given
          const submitButton = screen.getByRole('button', {
            name: 'Rechercher',
          })

          // When
          await userEvent.click(submitButton)

          // Then
          offresList = screen.getByRole('list', {
            description: 'Liste des résultats',
          })
        })

        it('affiche toutes les offres', async () => {
          expect(within(offresList).getAllByRole('listitem').length).toEqual(
            offresEmploi.length
          )
        })

        it('affiche chaque offre', async () => {
          offresEmploi.forEach((offre) => {
            const offreCard = within(offresList).getByRole('heading', {
              name: 'Offre n°' + offre.id,
            }).parentElement!
            expect(within(offreCard).getByText(offre.titre)).toBeInTheDocument()
            expect(
              within(offreCard).getByText(offre.typeContrat)
            ).toBeInTheDocument()
            expect(
              within(offreCard).getByText(offre.duree!)
            ).toBeInTheDocument()
            expect(
              within(offreCard).getByText(offre.nomEntreprise!)
            ).toBeInTheDocument()
            expect(
              within(offreCard).getByText(offre.localisation!)
            ).toBeInTheDocument()
            expect(
              within(offreCard).getByRole('link', {
                name: 'Détail de l’offre ' + offre.id,
              })
            ).toHaveAttribute('href', '/offres/' + offre.id)
          })
        })

        it('permet de partager chaque offre', () => {
          offresEmploi.forEach((offre) => {
            expect(
              within(offresList).getByRole('link', {
                name: `Partager offre numéro ${offre.id}`,
              })
            ).toHaveAttribute('href', `/offres/${offre.id}/partage`)
          })
        })

        it('vide les resultats lorsqu’on change le type d’offre', async () => {
          // Given
          expect(within(offresList).getAllByRole('listitem').length).toEqual(
            offresEmploi.length
          )
          // When
          await userEvent.click(screen.getByText('Service civique'))
          // Then
          expect(
            screen.queryByRole('list', {
              description: 'Liste des résultats',
            })
          ).not.toBeInTheDocument()
        })
      })
    })

    describe('type offre : service civique', () => {
      beforeEach(async () => {
        await userEvent.click(
          screen.getByRole('radio', { name: 'Service civique' })
        )
      })

      it('permet de definir des critères de recherche', () => {
        // Then
        const etape2 = screen.getByRole('group', {
          name: 'Étape 2 Critères de recherche',
        })

        expect(etape2).toBeInTheDocument()
        expect(
          within(etape2).getByRole('combobox', {
            name: 'Localisation Saisissez une ville',
          })
        ).toBeInTheDocument()
        expect(() =>
          within(etape2).getAllByRole('option', { hidden: true })
        ).toThrow()
      })

      describe('autocomplétion localisation', () => {
        it('retire les accents à la saisie', async () => {
          // Given
          const inputLocalisation = screen.getByLabelText(/Localisation/)

          // When
          await saisirLocalite(/Localisation/, 'Épinay-sur-Seine')

          // Then
          expect(inputLocalisation).toHaveValue('Epinay-sur-Seine')
          expect(referentielService.getCommunes).toHaveBeenCalledTimes(1)
          expect(referentielService.getCommunes).toHaveBeenCalledWith(
            'Epinay-sur-Seine'
          )
        })

        it('récupère les communes à la saisie', async () => {
          // When
          await saisirLocalite(/Localisation/, 'Epinay-sur-Seine')

          // Then
          expect(referentielService.getCommunes).toHaveBeenCalledTimes(1)
          expect(referentielService.getCommunes).toHaveBeenCalledWith(
            'Epinay-sur-Seine'
          )
          expect(screen.getAllByRole('option', { hidden: true })).toHaveLength(
            communes.length
          )
          communes.forEach((commune) => {
            expect(
              screen.getByRole('option', {
                hidden: true,
                name: commune.libelle,
              })
            ).toHaveValue(commune.libelle)
          })
        })

        it('affiche une erreur quand la localisation est incorrecte', async () => {
          // Given
          const inputLocalisation = screen.getByLabelText(/Localisation/)
          const submitButton = screen.getByRole('button', {
            name: 'Rechercher',
          })

          // When
          await userEvent.type(inputLocalisation, 'paris14')

          await act(() => {
            fireEvent.blur(inputLocalisation)
          })
          await userEvent.click(submitButton)

          // Then
          expect(
            screen.getByText('Veuillez saisir une localisation correcte.')
          ).toBeInTheDocument()
          expect(offresEmploiService.searchOffresEmploi).toHaveBeenCalledTimes(
            0
          )
        })
      })

      describe('permet d’affiner la recherche par des filtres', () => {
        it('permet d’ajouter plus de filtre à notre recherche', async () => {
          // Then
          expect(() =>
            screen.getByRole('group', { name: 'Étape 3 Plus de critères' })
          ).toThrow()
          expect(
            screen.getByRole('button', { name: 'Voir plus de critères' })
          ).toBeInTheDocument()

          // When
          await userEvent.click(screen.getByText('Voir plus de critères'))

          // Then
          expect(screen.getByText('Voir moins de critères')).toBeInTheDocument()
        })

        it('permet de selectionner un domaine', async () => {
          // When
          await userEvent.click(screen.getByText('Voir plus de critères'))

          // Then
          const etape3 = screen.getByRole('group', {
            name: 'Étape 3 Plus de critères',
          })
          const selectDomaine = within(etape3).getByRole('combobox', {
            name: 'Sélectionner domaine',
          })
          domainesServiceCivique.forEach((domaine) => {
            expect(
              within(selectDomaine).getByRole('option', {
                name: domaine.libelle,
              })
            ).toHaveValue(domaine.code)
          })
        })

        it("permet d'afficher uniquement les offres débutant dès que possible", async () => {
          // When
          await userEvent.click(screen.getByText('Voir plus de critères'))

          // Then
          const etape3 = screen.getByRole('group', {
            name: 'Étape 3 Plus de critères',
          })
          const dateDebutGroupe = within(etape3).getByRole('group', {
            name: 'Date de début',
          })
          expect(
            within(dateDebutGroupe).getByRole('checkbox', {
              name: /Dès que possible/,
            })
          ).toBeChecked()
          expect(
            within(dateDebutGroupe).getByRole('checkbox', {
              name: /À partir de/,
            })
          ).not.toBeChecked()
          expect(
            within(dateDebutGroupe).getByRole('checkbox', {
              name: /À partir de/,
            })
          ).toHaveAttribute('disabled')
        })

        it('permet de définir une date de début', async () => {
          // Given
          const today = '2022-10-12'
          jest.spyOn(DateTime, 'now').mockReturnValue(DateTime.fromISO(today))

          // When
          await userEvent.click(screen.getByText('Voir plus de critères'))
          const etape3 = screen.getByRole('group', {
            name: 'Étape 3 Plus de critères',
          })
          expect(() => within(etape3).getByLabelText('Date de début')).toThrow()

          await userEvent.click(screen.getByLabelText(/Dès que possible/))

          // Then
          const dateDebutGroupe = within(etape3).getByRole('group', {
            name: 'Date de début',
          })
          expect(
            within(dateDebutGroupe).getByRole('checkbox', {
              name: /Dès que possible/,
            })
          ).not.toBeChecked()
          expect(
            within(dateDebutGroupe).getByRole('checkbox', {
              name: /À partir de/,
            })
          ).toBeChecked()
          const inputDate = within(dateDebutGroupe).getByLabelText(
            'Sélectionner une date de début'
          )
          expect(inputDate).toHaveAttribute('type', 'date')
          expect(inputDate).toHaveAttribute('value', today)
        })

        it('permet de définir un rayon de recherche si une commune est sélectionnée', async () => {
          // When
          await userEvent.click(screen.getByText('Voir plus de critères'))
          const etape3 = screen.getByRole('group', {
            name: 'Étape 3 Plus de critères',
          })
          expect(() =>
            within(etape3).getByRole('group', { name: 'Distance' })
          ).toThrow()

          await saisirLocalite(/Localisation/, 'paris 14')

          // Then
          const distanceGroup = within(etape3).getByRole('group', {
            name: 'Distance',
          })
          const inputRange = within(distanceGroup).getByRole('slider', {
            name: 'Dans un rayon de : 10km',
          })
          expect(inputRange).toHaveAttribute('value', '10')
          expect(inputRange).toHaveAttribute('type', 'range')
          expect(inputRange).toHaveAttribute('min', '0')
          expect(inputRange).toHaveAttribute('max', '100')
        })

        it("retiens les critères d'affinage saisie", async () => {
          // Given
          await userEvent.click(screen.getByText('Voir plus de critères'))

          // When-Then
          await userEvent.selectOptions(
            screen.getByLabelText('Sélectionner domaine'),
            domainesServiceCivique[2].libelle
          )
          expect(
            screen.getByText('[1] critère sélectionné')
          ).toBeInTheDocument()

          await userEvent.click(screen.getByLabelText(/Dès que possible/))
          fireEvent.change(
            screen.getByLabelText('Sélectionner une date de début'),
            { target: { value: '2022-11-01' } }
          )
          expect(
            screen.getByText('[2] critères sélectionnés')
          ).toBeInTheDocument()

          await saisirLocalite(/Localisation/, 'paris 14')
          fireEvent.change(screen.getByLabelText(/Dans un rayon de/), {
            target: { value: 43 },
          })
          expect(
            getByTextContent('Dans un rayon de : 43km')
          ).toBeInTheDocument()
          expect(
            screen.getByText('[3] critères sélectionnés')
          ).toBeInTheDocument()

          // When
          await userEvent.click(screen.getByText('Voir moins de critères'))
          await userEvent.click(screen.getByText('Voir plus de critères'))

          // Then
          expect(screen.getByLabelText(/domaine/)).toHaveValue(
            domainesServiceCivique[2].code
          )
          expect(screen.getByLabelText(/Dès que possible/)).not.toBeChecked()
          expect(screen.getByLabelText(/À partir de/)).toBeChecked()
          expect(screen.getByLabelText(/date de début/)).toHaveValue(
            '2022-11-01'
          )
          expect(screen.getByLabelText(/rayon/)).toHaveValue('43')
        })
      })

      describe('recherche', () => {
        it('permet de rechercher des offres de services civiques', async () => {
          // Given
          const submitButton = screen.getByRole('button', {
            name: 'Rechercher',
          })

          // When
          await userEvent.click(submitButton)

          // Then
          expect(
            servicesCiviquesService.searchServicesCiviques
          ).toHaveBeenCalledWith({})
        })

        it('construit la recherche avec une commune', async () => {
          // Given
          const submitButton = screen.getByRole('button', {
            name: 'Rechercher',
          })

          // When
          await saisirLocalite(/Localisation/, 'paris 14')
          await userEvent.click(submitButton)

          // Then
          expect(
            servicesCiviquesService.searchServicesCiviques
          ).toHaveBeenCalledWith({
            coordonnees: { lon: 2.323026, lat: 48.830108 },
            rayon: 10,
          })
        })

        it('construit la recherche avec les critères d’affinage', async () => {
          // Given
          await saisirLocalite(/Localisation/, 'paris 14')
          await userEvent.click(screen.getByText('Voir plus de critères'))

          await userEvent.selectOptions(
            screen.getByLabelText('Sélectionner domaine'),
            domainesServiceCivique[2].libelle
          )
          await userEvent.click(screen.getByLabelText(/Dès que possible/))
          fireEvent.change(
            screen.getByLabelText('Sélectionner une date de début'),
            { target: { value: '2022-11-01' } }
          )
          fireEvent.change(screen.getByLabelText(/Dans un rayon de/), {
            target: { value: 43 },
          })

          // When
          await userEvent.click(
            screen.getByRole('button', { name: 'Rechercher' })
          )

          // Then
          expect(
            servicesCiviquesService.searchServicesCiviques
          ).toHaveBeenCalledWith({
            coordonnees: { lon: 2.323026, lat: 48.830108 },
            domaine: domainesServiceCivique[2].code,
            dateDebut: DateTime.fromISO('2022-11-01'),
            rayon: 43,
          })
        })
      })

      describe('recherche réussie', () => {
        let offresList: HTMLElement
        beforeEach(async () => {
          // Given
          const submitButton = screen.getByRole('button', {
            name: 'Rechercher',
          })

          // When
          await userEvent.click(submitButton)

          // Then
          offresList = screen.getByRole('list', {
            description: 'Liste des résultats',
          })
        })

        it('affiche toutes les offres', async () => {
          expect(within(offresList).getAllByRole('listitem').length).toEqual(
            servicesCiviques.length
          )
        })

        it('affiche chaque offre', async () => {
          servicesCiviques.forEach((offre) => {
            const offreCard = within(offresList).getByRole('heading', {
              name: 'Offre n°' + offre.id,
            }).parentElement!
            expect(within(offreCard).getByText(offre.titre)).toBeInTheDocument()
            // expect(
            //   within(offreCard).getByText(offre.typeContrat)
            // ).toBeInTheDocument()
            // expect(
            //   within(offreCard).getByText(offre.duree!)
            // ).toBeInTheDocument()
            // expect(
            //   within(offreCard).getByText(offre.nomEntreprise!)
            // ).toBeInTheDocument()
            // expect(
            //   within(offreCard).getByText(offre.localisation!)
            // ).toBeInTheDocument()
            // expect(
            //   within(offreCard).getByRole('link', {
            //     name: 'Détail de l’offre ' + offre.id,
            //   })
            // ).toHaveAttribute('href', '/offres/' + offre.id)
          })
        })

        //   it('permet de partager chaque offre', () => {
        //     servicesCiviques.forEach((offre) => {
        //       expect(
        //         within(offresList).getByRole('link', {
        //           name: `Partager offre numéro ${offre.id}`,
        //         })
        //       ).toHaveAttribute('href', `/offres/${offre.id}/partage`)
        //     })
        //   })

        it('vide les resultats lorsqu’on change le type d’offre', async () => {
          // Given
          expect(within(offresList).getAllByRole('listitem').length).toEqual(
            servicesCiviques.length
          )
          // When
          await userEvent.click(screen.getByText('Offre d’emploi'))
          // Then
          expect(
            screen.queryByRole('list', {
              description: 'Liste des résultats',
            })
          ).not.toBeInTheDocument()
        })
      })
    })

    it('n’affiche pas de résultat par défaut', () => {
      // Then
      expect(() => screen.getByText('Liste des résultats')).toThrow()
      expect(() => screen.getByRole('list')).toThrow()
    })

    it('affiche une erreur si la recherche échoue', async () => {
      // Given
      await userEvent.click(
        screen.getByRole('radio', { name: 'Offre d’emploi' })
      )
      ;(offresEmploiService.searchOffresEmploi as jest.Mock).mockRejectedValue(
        'whatever'
      )

      // When
      const submitButton = screen.getByRole('button', { name: 'Rechercher' })
      await userEvent.click(submitButton)

      // Then
      expect(screen.getByRole('alert')).toHaveTextContent(
        /Une erreur est survenue/
      )
    })

    it("affiche un message s'il n'y a pas de résultat", async () => {
      // Given
      await userEvent.click(
        screen.getByRole('radio', { name: 'Offre d’emploi' })
      )
      ;(offresEmploiService.searchOffresEmploi as jest.Mock).mockResolvedValue(
        []
      )

      // When
      const submitButton = screen.getByRole('button', { name: 'Rechercher' })
      await userEvent.click(submitButton)

      // Then
      expect(
        screen.getByText(
          'Aucune offre ne correspond à vos critères de recherche.'
        )
      )
    })
  })

  describe('server side', () => {
    it('requiert la connexion', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: false,
        redirect: { destination: 'whatever' },
      })

      // When
      const actual = await getServerSideProps({} as GetServerSidePropsContext)

      // Then
      expect(withMandatorySessionOrRedirect).toHaveBeenCalled()
      expect(actual).toEqual({ redirect: { destination: 'whatever' } })
    })

    it('charge la page avec les bonnes props', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: true,
      })

      // When
      const actual = await getServerSideProps({
        query: {},
      } as GetServerSidePropsContext)

      // Then
      expect(actual).toEqual({
        props: {
          pageTitle: 'Recherche d’offres',
          pageHeader: 'Offres',
        },
      })
    })

    it('récupère la réussite du partage', async () => {
      // Given
      ;(withMandatorySessionOrRedirect as jest.Mock).mockResolvedValue({
        validSession: true,
      })

      // When
      const actual = await getServerSideProps({
        query: { partageOffre: 'succes' },
      } as unknown as GetServerSidePropsContext)

      // Then
      expect(actual).toEqual({
        props: {
          pageTitle: 'Recherche d’offres',
          pageHeader: 'Offres',
          partageSuccess: true,
        },
      })
    })
  })
})

async function saisirLocalite(labelInput: RegExp, text: string) {
  await userEvent.type(screen.getByLabelText(labelInput), text)
  await act(() => new Promise((r) => setTimeout(r, 500)))
}

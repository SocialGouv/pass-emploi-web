import { act, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateTime } from 'luxon'
import React from 'react'

import {
  listeBaseServicesCiviques,
  uneBaseServiceCivique,
} from 'fixtures/offre'
import { desCommunes, desLocalites, uneCommune } from 'fixtures/referentiel'
import {
  mockedReferentielService,
  mockedServicesCiviquesService,
} from 'fixtures/services'
import { BaseServiceCivique } from 'interfaces/offre'
import { Localite } from 'interfaces/referentiel'
import RechercheOffres from 'pages/recherche-offres'
import { domainesServiceCivique } from 'referentiel/domaines-service-civique'
import { ReferentielService } from 'services/referentiel.service'
import { ServicesCiviquesService } from 'services/services-civiques.service'
import { getByTextContent } from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('utils/auth/withMandatorySessionOrRedirect')

describe('Page Recherche Offres', () => {
  let servicesCiviquesService: ServicesCiviquesService
  let referentielService: ReferentielService

  let servicesCiviques: BaseServiceCivique[]
  let communes: Localite[]
  beforeEach(async () => {
    communes = desCommunes()
    servicesCiviques = listeBaseServicesCiviques()
    referentielService = mockedReferentielService({
      getCommunesEtDepartements: jest.fn().mockResolvedValue(desLocalites()),
      getCommunes: jest.fn().mockResolvedValue(desCommunes()),
    })
    servicesCiviquesService = mockedServicesCiviquesService({
      searchServicesCiviques: jest.fn().mockResolvedValue({
        metadonnees: { nombreTotal: 10, nombrePages: 4 },
        offres: servicesCiviques,
      }),
    })

    renderWithContexts(<RechercheOffres pageTitle='' />, {
      customDependances: {
        referentielService,
        servicesCiviquesService,
      },
    })
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
      await saisirCommune('Épinay-sur-Seine')

      // Then
      expect(inputLocalisation).toHaveValue('EPINAY SUR SEINE')
      expect(referentielService.getCommunes).toHaveBeenCalledTimes(1)
      expect(referentielService.getCommunes).toHaveBeenCalledWith(
        'EPINAY SUR SEINE'
      )
    })

    it('récupère les communes à la saisie', async () => {
      // When
      await saisirCommune('Epinay-sur-Seine')

      // Then
      expect(referentielService.getCommunes).toHaveBeenCalledTimes(1)
      expect(referentielService.getCommunes).toHaveBeenCalledWith(
        'EPINAY SUR SEINE'
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
        screen.getByText('Veuillez saisir une commune correcte.')
      ).toBeInTheDocument()
      expect(
        servicesCiviquesService.searchServicesCiviques
      ).toHaveBeenCalledTimes(0)
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

      await saisirCommune('paris 14 (75)')

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
      expect(screen.getByText('[1] critère sélectionné')).toBeInTheDocument()

      await userEvent.click(screen.getByLabelText(/Dès que possible/))
      fireEvent.change(
        screen.getByLabelText('Sélectionner une date de début'),
        { target: { value: '2022-11-01' } }
      )
      expect(screen.getByText('[2] critères sélectionnés')).toBeInTheDocument()

      await saisirCommune('paris 14 (75)')
      fireEvent.change(screen.getByLabelText(/Dans un rayon de/), {
        target: { value: 43 },
      })
      expect(getByTextContent('Dans un rayon de : 43km')).toBeInTheDocument()
      expect(screen.getByText('[3] critères sélectionnés')).toBeInTheDocument()

      // When
      await userEvent.click(screen.getByText('Voir moins de critères'))
      await userEvent.click(screen.getByText('Voir plus de critères'))

      // Then
      expect(screen.getByLabelText(/domaine/)).toHaveValue(
        domainesServiceCivique[2].code
      )
      expect(screen.getByLabelText(/Dès que possible/)).not.toBeChecked()
      expect(screen.getByLabelText(/À partir de/)).toBeChecked()
      expect(screen.getByLabelText(/date de début/)).toHaveValue('2022-11-01')
      expect(screen.getByLabelText(/rayon/)).toHaveValue('43')
    })
  })

  describe('partage des critères de recherche', () => {
    it('ne permet pas de partager s’il n’y a pas de commune renseignée', async () => {
      await userEvent.click(
        screen.getByRole('button', {
          name: `Partager critères de recherche`,
        })
      )

      expect(
        screen.getByText(
          'Pour suggérer des critères de recherche, vous devez saisir une ville.'
        )
      ).toBeInTheDocument()
    })

    it('affiche le bouton de partage de critère s’il y a une commune renseignés', async () => {
      // When
      await saisirCommune('paris 14 (75)')

      // Then
      expect(
        screen.getByText(
          'Suggérer ces critères de recherche à vos bénéficiaires'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', {
          name: `Partager critères de recherche`,
        })
      ).toBeInTheDocument()
    })

    it('construit le bon lien qui correspond aux critères de recherches', async () => {
      // Given
      await saisirCommune('paris 14 (75)')

      // Then
      expect(
        screen.getByRole('link', {
          name: `Partager critères de recherche`,
        })
      ).toHaveAttribute(
        'href',
        `/offres/partage-recherche?type=SERVICE_CIVIQUE&titre=PARIS%2014%20(75)&labelLocalite=PARIS%2014%20(75)&latitude=48.830108&longitude=2.323026`
      )
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
      ).toHaveBeenCalledWith({}, 1)
    })

    it('construit la recherche avec une commune', async () => {
      // Given
      const submitButton = screen.getByRole('button', {
        name: 'Rechercher',
      })

      // When
      await saisirCommune('paris 14 (75)')
      await userEvent.click(submitButton)

      // Then
      expect(
        servicesCiviquesService.searchServicesCiviques
      ).toHaveBeenCalledWith(
        {
          commune: uneCommune(),
          rayon: 10,
        },
        1
      )
    })

    it('construit la recherche avec les critères d’affinage', async () => {
      // Given
      await saisirCommune('paris 14 (75)')
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
      await userEvent.click(screen.getByRole('button', { name: 'Rechercher' }))

      // Then
      expect(
        servicesCiviquesService.searchServicesCiviques
      ).toHaveBeenCalledWith(
        {
          commune: uneCommune(),
          domaine: domainesServiceCivique[2].code,
          dateDebut: DateTime.fromISO('2022-11-01'),
          rayon: 43,
        },
        1
      )
    })

    it('vide les critères lorsqu’on change le type d’offre', async () => {
      // Given
      await saisirCommune('paris 14 (75)')
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

      await userEvent.click(screen.getByText('Immersion'))
      await userEvent.click(screen.getByText('Service civique'))

      // When
      await userEvent.click(screen.getByRole('button', { name: 'Rechercher' }))

      // Then
      expect(
        servicesCiviquesService.searchServicesCiviques
      ).toHaveBeenCalledWith({}, 1)
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
        description: 'Liste des résultats (10 offres)',
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
          level: 3,
          name: offre.titre,
        }).parentElement!
        expect(within(offreCard).getByText(offre.domaine)).toBeInTheDocument()
        expect(
          within(offreCard).getByText(offre.organisation!)
        ).toBeInTheDocument()
        expect(within(offreCard).getByText(offre.ville!)).toBeInTheDocument()
        expect(
          within(offreCard).getByRole('link', {
            name: 'Détail de l’offre ' + offre.titre,
          })
        ).toHaveAttribute('href', '/offres/service-civique/' + offre.id)
      })
    })

    it('permet de partager chaque offre', () => {
      servicesCiviques.forEach((offre) => {
        expect(
          within(offresList).getByRole('link', {
            name: `Partager offre ${offre.titre}`,
          })
        ).toHaveAttribute('href', `/offres/service-civique/${offre.id}/partage`)
      })
    })

    it('cache le formulaire', async () => {
      // Given
      const queryEtape1 = () => screen.queryByRole('group', { name: /Étape 1/ })

      // When
      await userEvent.click(
        screen.getByRole('button', { name: /Cacher les critères/ })
      )
      // Then
      expect(queryEtape1()).not.toBeInTheDocument()

      // When
      await userEvent.click(
        screen.getByRole('button', { name: /Voir les critères/ })
      )
      // Then
      expect(queryEtape1()).toBeInTheDocument()
    })

    it("vide les resultats lorsqu'un champ du formulaire change", async () => {
      // Given
      expect(within(offresList).getAllByRole('listitem').length).toBeTruthy()

      // When
      await userEvent.type(screen.getByLabelText(/Localisation/), 'Rennes')

      // Then
      expect(
        screen.queryByRole('list', {
          description: 'Liste des résultats',
        })
      ).not.toBeInTheDocument()
    })

    it("bloque la recherche tant que les champs n'ont pas changés", async () => {
      // Then
      expect(
        screen.getByRole('button', { name: 'Rechercher' })
      ).toHaveAttribute('disabled')
    })

    describe('pagination', () => {
      beforeEach(() => {
        ;(
          servicesCiviquesService.searchServicesCiviques as jest.Mock
        ).mockImplementation((_query, page) => ({
          metadonnees: { nombreTotal: 10, nombrePages: 4 },
          offres: [uneBaseServiceCivique({ titre: 'Offre page ' + page })],
        }))
      })

      it('met à jour les offres avec la page demandée ', async () => {
        // When
        await userEvent.click(screen.getByLabelText('Page 2'))

        // Then
        expect(
          servicesCiviquesService.searchServicesCiviques
        ).toHaveBeenCalledWith({}, 2)
        expect(screen.getByText('Offre page 2')).toBeInTheDocument()
      })

      it('met à jour la page courante', async () => {
        // When
        await userEvent.click(screen.getByLabelText('Page suivante'))
        await userEvent.click(screen.getByLabelText('Page suivante'))

        // Then
        expect(
          servicesCiviquesService.searchServicesCiviques
        ).toHaveBeenCalledWith({}, 2)
        expect(
          servicesCiviquesService.searchServicesCiviques
        ).toHaveBeenCalledWith({}, 3)

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
          servicesCiviquesService.searchServicesCiviques
        ).toHaveBeenCalledTimes(1)
      })
    })
  })
})

async function saisirCommune(text: string) {
  await userEvent.type(screen.getByLabelText(/Localisation/), text)
  await act(() => new Promise((r) => setTimeout(r, 500)))
}

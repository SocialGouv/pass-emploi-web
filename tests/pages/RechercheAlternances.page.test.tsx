import { act, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { listeBaseAlternances, uneBaseAlternance } from 'fixtures/offre'
import { desLocalites } from 'fixtures/referentiel'
import {
  mockedOffresEmploiService,
  mockedReferentielService,
} from 'fixtures/services'
import { BaseOffreEmploi } from 'interfaces/offre'
import { Localite } from 'interfaces/referentiel'
import RechercheOffres from 'pages/recherche-offres'
import { OffresEmploiService } from 'services/offres-emploi.service'
import { ReferentielService } from 'services/referentiel.service'
import { getByTextContent } from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('utils/auth/withMandatorySessionOrRedirect')

describe('Page Recherche Alternances', () => {
  let offresEmploiService: OffresEmploiService
  let referentielService: ReferentielService

  let alternances: BaseOffreEmploi[]
  let localites: Localite[]
  beforeEach(async () => {
    localites = desLocalites()
    alternances = listeBaseAlternances()
    offresEmploiService = mockedOffresEmploiService({
      searchAlternances: jest.fn().mockResolvedValue({
        metadonnees: { nombreTotal: 10, nombrePages: 4 },
        offres: alternances,
      }),
    })
    referentielService = mockedReferentielService({
      getCommunesEtDepartements: jest.fn().mockResolvedValue(desLocalites()),
    })

    renderWithContexts(<RechercheOffres pageTitle='' />, {
      customDependances: {
        offresEmploiService,
        referentielService,
      },
    })
    await userEvent.click(screen.getByRole('radio', { name: 'Alternance' }))
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
      await saisirLocalite('Ardèche')

      // Then
      expect(inputLocalisation).toHaveValue('ARDECHE')
      expect(
        referentielService.getCommunesEtDepartements
      ).toHaveBeenCalledTimes(1)
      expect(referentielService.getCommunesEtDepartements).toHaveBeenCalledWith(
        'ARDECHE'
      )
    })

    it('récupère les communes et les départements à la saisie', async () => {
      // When
      await saisirLocalite('Paris')

      // Then
      expect(
        referentielService.getCommunesEtDepartements
      ).toHaveBeenCalledTimes(1)
      expect(referentielService.getCommunesEtDepartements).toHaveBeenCalledWith(
        'PARIS'
      )
      expect(screen.getAllByRole('option', { hidden: true })).toHaveLength(
        localites.length
      )
      localites.forEach((localite) => {
        expect(
          screen.getByRole('option', {
            hidden: true,
            name: sanitize(localite.libelle),
          })
        ).toHaveValue(sanitize(localite.libelle))
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
      expect(offresEmploiService.searchAlternances).toHaveBeenCalledTimes(0)
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

      await saisirLocalite('paris 14')

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
        screen.getByLabelText(/Afficher uniquement les offres débutant accepté/)
      )
      expect(screen.getByText('[1] critère sélectionné')).toBeInTheDocument()

      await userEvent.click(screen.getByLabelText('CDI'))
      await userEvent.click(screen.getByLabelText(/CDD/))
      expect(screen.getByText('[2] critères sélectionnés')).toBeInTheDocument()

      await userEvent.click(screen.getByLabelText('Temps plein'))
      expect(screen.getByText('[3] critères sélectionnés')).toBeInTheDocument()

      await saisirLocalite('paris 14')
      fireEvent.change(screen.getByLabelText(/Dans un rayon de/), {
        target: { value: 43 },
      })
      expect(getByTextContent('Dans un rayon de : 43km')).toBeInTheDocument()
      expect(screen.getByText('[4] critères sélectionnés')).toBeInTheDocument()

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
    it('permet de rechercher des alternances', async () => {
      // Given
      const submitButton = screen.getByRole('button', {
        name: 'Rechercher',
      })

      // When
      await userEvent.click(submitButton)

      // Then
      expect(offresEmploiService.searchAlternances).toHaveBeenCalledWith({}, 1)
    })

    it('construit la recherche avec un département', async () => {
      // Given
      const inputMotsCles = screen.getByLabelText(/Mots clés/)
      const submitButton = screen.getByRole('button', {
        name: 'Rechercher',
      })

      // When
      await userEvent.type(inputMotsCles, 'prof industrie')
      await saisirLocalite('pAris')
      await userEvent.click(submitButton)

      // Then
      expect(offresEmploiService.searchAlternances).toHaveBeenCalledWith(
        {
          motsCles: 'prof industrie',
          departement: '75',
        },
        1
      )
    })

    it('construit la recherche avec une commune', async () => {
      // Given
      const inputMotsCles = screen.getByLabelText(/Mots clés/)
      const submitButton = screen.getByRole('button', {
        name: 'Rechercher',
      })

      // When
      await userEvent.type(inputMotsCles, 'prof industrie')
      await saisirLocalite('paris 14')
      await userEvent.click(submitButton)

      // Then
      expect(offresEmploiService.searchAlternances).toHaveBeenCalledWith(
        {
          motsCles: 'prof industrie',
          commune: '75114',
          rayon: 10,
        },
        1
      )
    })

    it('construit la recherche avec les critères d’affinage', async () => {
      // Given
      await saisirLocalite('paris 14')
      await userEvent.click(screen.getByText('Voir plus de critères'))

      await userEvent.click(
        screen.getByLabelText(/Afficher uniquement les offres débutant accepté/)
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
      await userEvent.click(screen.getByRole('button', { name: 'Rechercher' }))

      // Then
      expect(offresEmploiService.searchAlternances).toHaveBeenCalledWith(
        {
          commune: '75114',
          debutantAccepte: true,
          typesContrats: ['CDI', 'CDD-interim-saisonnier'],
          durees: ['Temps plein'],
          rayon: 43,
        },
        1
      )
    })

    it('vide les critères lorsqu’on change le type d’offre', async () => {
      // Given
      await saisirLocalite('paris 14')
      await userEvent.click(screen.getByText('Voir plus de critères'))

      await userEvent.click(
        screen.getByLabelText(/Afficher uniquement les offres débutant accepté/)
      )

      await userEvent.click(screen.getByLabelText('CDI'))
      await userEvent.click(screen.getByLabelText('Temps plein'))
      fireEvent.change(screen.getByLabelText(/Dans un rayon de/), {
        target: { value: 43 },
      })

      await userEvent.click(screen.getByText('Service civique'))
      await userEvent.click(screen.getByText('Alternance'))

      // When
      await userEvent.click(screen.getByRole('button', { name: 'Rechercher' }))

      // Then
      expect(offresEmploiService.searchAlternances).toHaveBeenCalledWith({}, 1)
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
        description: `Liste des résultats (10 offres)`,
      })
    })

    it('affiche les offres', async () => {
      expect(within(offresList).getAllByRole('listitem').length).toEqual(
        alternances.length
      )
    })

    it('affiche chaque offre', async () => {
      alternances.forEach((alternance) => {
        const offreCard = within(offresList).getByRole('heading', {
          level: 3,
          name: 'Offre n°' + alternance.id,
        }).parentElement!
        expect(within(offreCard).getByText('Alternance')).toBeInTheDocument()
        expect(within(offreCard).getByText(alternance.titre)).toBeInTheDocument()
        expect(
          within(offreCard).getByText(alternance.typeContrat)
        ).toBeInTheDocument()
        expect(within(offreCard).getByText(alternance.duree!)).toBeInTheDocument()
        expect(
          within(offreCard).getByText(alternance.nomEntreprise!)
        ).toBeInTheDocument()
        expect(
          within(offreCard).getByText(alternance.localisation!)
        ).toBeInTheDocument()
        // expect(
        //   within(offreCard).getByRole('link', {
        //     name: 'Détail de l’offre ' + alternance.id,
        //   })
        // ).toHaveAttribute('href', '/offres/' + alternance.id)
      })
    })

    // it('permet de partager chaque offre', () => {
    //   alternances.forEach((offre) => {
    //     expect(
    //       within(offresList).getByRole('link', {
    //         name: `Partager offre numéro ${offre.id}`,
    //       })
    //     ).toHaveAttribute('href', `/offres/${offre.id}/partage`)
    //   })
    // })

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
      await userEvent.type(screen.getByLabelText(/Mots clés/), 'Boulanger')

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
          offresEmploiService.searchAlternances as jest.Mock
        ).mockImplementation((_query, page) => ({
          metadonnees: { nombreTotal: 10, nombrePages: 4 },
          offres: [uneBaseAlternance({ titre: 'Offre page ' + page })],
        }))
      })

      it('met à jour les offres avec la page demandée ', async () => {
        // When
        await userEvent.click(screen.getByLabelText('Page 2'))

        // Then
        expect(offresEmploiService.searchAlternances).toHaveBeenCalledWith(
          {},
          2
        )
        expect(screen.getByText('Offre page 2')).toBeInTheDocument()
      })

      it('met à jour la page courante', async () => {
        // When
        await userEvent.click(screen.getByLabelText('Page suivante'))
        await userEvent.click(screen.getByLabelText('Page suivante'))

        // Then
        expect(offresEmploiService.searchAlternances).toHaveBeenCalledWith(
          {},
          2
        )
        expect(offresEmploiService.searchAlternances).toHaveBeenCalledWith(
          {},
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
        expect(offresEmploiService.searchAlternances).toHaveBeenCalledTimes(1)
      })
    })
  })
})

async function saisirLocalite(text: string) {
  await userEvent.type(screen.getByLabelText(/Lieu de travail/), text)
  await act(() => new Promise((r) => setTimeout(r, 500)))
}

function sanitize(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['-]/g, ' ')
    .toUpperCase()
}

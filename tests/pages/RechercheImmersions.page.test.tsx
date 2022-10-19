import { act, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { listeBaseImmersions } from 'fixtures/offre'
import {
  desCommunes,
  desMetiers,
  uneCommune,
  unMetier,
} from 'fixtures/referentiel'
import {
  mockedImmersionsService,
  mockedReferentielService,
} from 'fixtures/services'
import { BaseImmersion } from 'interfaces/offre'
import { Commune, Metier } from 'interfaces/referentiel'
import RechercheOffres from 'pages/recherche-offres'
import { ImmersionsService } from 'services/immersions.service'
import { ReferentielService } from 'services/referentiel.service'
import { getByTextContent } from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('utils/auth/withMandatorySessionOrRedirect')

describe('Page Recherche Immersions', () => {
  let immersionsService: ImmersionsService
  let referentielService: ReferentielService

  let immersions: BaseImmersion[]
  let metiers: Metier[]
  let communes: Commune[]
  beforeEach(async () => {
    metiers = desMetiers()
    communes = desCommunes()
    immersions = listeBaseImmersions()
    immersionsService = mockedImmersionsService({
      searchImmersions: jest.fn().mockResolvedValue(immersions),
    })
    referentielService = mockedReferentielService({
      getMetiers: jest.fn(async () => metiers),
      getCommunes: jest.fn(async () => communes),
    })

    renderWithContexts(<RechercheOffres pageTitle='' />, {
      customDependances: { referentielService, immersionsService },
    })
    await userEvent.click(screen.getByRole('radio', { name: 'Immersion' }))
  })

  it('permet de definir des critères de recherche', () => {
    // Then
    const etape2 = screen.getByRole('group', {
      name: 'Étape 2 Critères de recherche',
    })

    expect(etape2).toBeInTheDocument()
    expect(
      within(etape2).getByRole('combobox', { name: 'Métier' })
    ).toHaveAttribute('aria-required')
    expect(
      within(etape2).getByRole('combobox', {
        name: 'Localisation Saisissez une ville',
      })
    ).toHaveAttribute('aria-required')
    expect(() =>
      within(etape2).getAllByRole('option', { hidden: true })
    ).toThrow()
  })

  describe('autocomplétion métier', () => {
    it('retire les accents à la saisie', async () => {
      // Given
      const inputMetier = screen.getByLabelText(/Métier/)

      // When
      await saisirMetier('Développeuse')

      // Then
      expect(inputMetier).toHaveValue('DEVELOPPEUSE')
      expect(referentielService.getMetiers).toHaveBeenCalledTimes(1)
      expect(referentielService.getMetiers).toHaveBeenCalledWith('DEVELOPPEUSE')
    })

    it('récupère les métiers à la saisie', async () => {
      // When
      await saisirMetier('Développeuse')

      // Then
      expect(referentielService.getMetiers).toHaveBeenCalledTimes(1)
      expect(referentielService.getMetiers).toHaveBeenCalledWith('DEVELOPPEUSE')
      expect(screen.getAllByRole('option', { hidden: true })).toHaveLength(
        metiers.length
      )
      metiers.forEach((metier) => {
        expect(
          screen.getByRole('option', {
            hidden: true,
            name: sanitize(metier.libelle),
          })
        ).toHaveValue(sanitize(metier.libelle))
      })
    })

    it('affiche une erreur quand le métier est vide', async () => {
      // Given
      const inputMetier = screen.getByLabelText(/Métier/)
      const submitButton = screen.getByRole('button', {
        name: 'Rechercher',
      })

      // When
      await userEvent.clear(inputMetier)

      await act(() => {
        fireEvent.blur(inputMetier)
      })
      await userEvent.click(submitButton)

      // Then
      expect(
        screen.getByText('Veuillez saisir un métier correct.')
      ).toBeInTheDocument()
      expect(immersionsService.searchImmersions).toHaveBeenCalledTimes(0)
    })

    it('affiche une erreur quand le métier est incorrect', async () => {
      // Given
      const inputMetier = screen.getByLabelText(/Métier/)
      const submitButton = screen.getByRole('button', {
        name: 'Rechercher',
      })

      // When
      await userEvent.type(inputMetier, 'devlopr')

      await act(() => {
        fireEvent.blur(inputMetier)
      })
      await userEvent.click(submitButton)

      // Then
      expect(
        screen.getByText('Veuillez saisir un métier correct.')
      ).toBeInTheDocument()
      expect(immersionsService.searchImmersions).toHaveBeenCalledTimes(0)
    })
  })

  describe('autocomplétion localisation', () => {
    it('retire les accents à la saisie', async () => {
      // Given
      const inputLocalisation = screen.getByLabelText(/Localisation/)

      // When
      await saisirCommune("L'Haÿ-les-Roses")

      // Then
      expect(inputLocalisation).toHaveValue('L HAY LES ROSES')
      expect(referentielService.getCommunes).toHaveBeenCalledTimes(1)
      expect(referentielService.getCommunes).toHaveBeenCalledWith(
        'L HAY LES ROSES'
      )
    })

    it('récupère les communes à la saisie', async () => {
      // When
      await saisirCommune('Paris')

      // Then
      expect(referentielService.getCommunes).toHaveBeenCalledTimes(1)
      expect(referentielService.getCommunes).toHaveBeenCalledWith('PARIS')
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

    it('affiche une erreur quand la localisation est vide', async () => {
      // Given
      const inputLocalisation = screen.getByLabelText(/Localisation/)
      const submitButton = screen.getByRole('button', {
        name: 'Rechercher',
      })

      // When
      await userEvent.clear(inputLocalisation)

      await act(() => {
        fireEvent.blur(inputLocalisation)
      })
      await userEvent.click(submitButton)

      // Then
      expect(
        screen.getByText('Veuillez saisir une commune correcte.')
      ).toBeInTheDocument()
      expect(immersionsService.searchImmersions).toHaveBeenCalledTimes(0)
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
      expect(immersionsService.searchImmersions).toHaveBeenCalledTimes(0)
    })
  })

  describe('permet d’affiner la recherche par des filtres', () => {
    it('permet d’ajouter plus de filtre à la recherche', async () => {
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

    it('permet de définir un rayon de recherche si une commune est sélectionnée', async () => {
      // Given
      await userEvent.click(screen.getByText('Voir plus de critères'))
      const etape3 = screen.getByRole('group', {
        name: 'Étape 3 Plus de critères',
      })
      expect(() =>
        within(etape3).getByRole('group', { name: 'Distance' })
      ).toThrow()

      // When
      await saisirCommune('paris 14')

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
      await saisirCommune('paris 14')
      fireEvent.change(screen.getByLabelText(/Dans un rayon de/), {
        target: { value: 43 },
      })
      expect(getByTextContent('* Dans un rayon de : 43km')).toBeInTheDocument()
      expect(screen.getByText('[1] critère sélectionné')).toBeInTheDocument()

      // When
      await userEvent.click(screen.getByText('Voir moins de critères'))
      await userEvent.click(screen.getByText('Voir plus de critères'))

      // Then
      expect(screen.getByLabelText(/rayon/)).toHaveValue('43')
    })
  })

  describe('recherche', () => {
    it('requiert les champs', async () => {
      // Given
      const submitButton = screen.getByRole('button', {
        name: 'Rechercher',
      })

      // When
      await userEvent.click(submitButton)

      // Then
      expect(submitButton).toHaveAttribute('disabled')
      expect(immersionsService.searchImmersions).toHaveBeenCalledTimes(0)
    })

    it('requiert le métier', async () => {
      // Given
      const submitButton = screen.getByRole('button', {
        name: 'Rechercher',
      })

      // When
      await saisirCommune('paris 14')
      await userEvent.click(submitButton)

      // Then
      expect(immersionsService.searchImmersions).toHaveBeenCalledTimes(0)
    })

    it('requiert la commune', async () => {
      // Given
      const submitButton = screen.getByRole('button', {
        name: 'Rechercher',
      })

      // When
      await saisirMetier('développeur / développeuse web')
      await userEvent.click(submitButton)

      // Then
      expect(immersionsService.searchImmersions).toHaveBeenCalledTimes(0)
    })

    it('construit la recherche', async () => {
      // Given
      const submitButton = screen.getByRole('button', {
        name: 'Rechercher',
      })

      // When
      await saisirMetier('développeur / développeuse web')
      await saisirCommune('paris 14')
      await userEvent.click(submitButton)

      // Then
      expect(immersionsService.searchImmersions).toHaveBeenCalledWith({
        metier: unMetier(),
        commune: uneCommune(),
        rayon: 10,
      })
    })

    it('vide les critères lorsqu’on change le type d’offre', async () => {
      // Given
      await saisirMetier('développeur / développeuse web')
      await saisirMetier('paris 14')

      await userEvent.click(screen.getByText('Service civique'))
      await userEvent.click(screen.getByText('Immersion'))

      // When
      await userEvent.click(screen.getByRole('button', { name: 'Rechercher' }))

      // Then
      expect(immersionsService.searchImmersions).toHaveBeenCalledTimes(0)
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
      await saisirMetier('développeur / développeuse web')
      await saisirCommune('paris 14')
      await userEvent.click(submitButton)

      // Then
      offresList = screen.getByRole('list', {
        description: `Liste des résultats (${immersions.length} offres)`,
      })
    })

    it('affiche les offres', async () => {
      expect(within(offresList).getAllByRole('listitem').length).toEqual(
        immersions.length
      )
    })

    it('affiche chaque offre', async () => {
      immersions.forEach((immersion) => {
        const immersionCard = within(offresList).getByRole('heading', {
          level: 3,
          name: immersion.metier,
        }).parentElement!
        expect(
          within(immersionCard).getByText(immersion.nomEtablissement)
        ).toBeInTheDocument()
        expect(
          within(immersionCard).getByText(immersion.ville)
        ).toBeInTheDocument()
        expect(
          within(immersionCard).getByText(immersion.secteurActivite)
        ).toBeInTheDocument()
      })
    })

    //   it('permet de partager chaque offre', () => {
    //     immersions.forEach((offre) => {
    //       expect(
    //         within(offresList).getByRole('link', {
    //           name: `Partager offre numéro ${offre.id}`,
    //         })
    //       ).toHaveAttribute('href', `/offres/${offre.id}/partage`)
    //     })
    //   })

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
      await saisirMetier('Designeuse')

      // Then
      expect(
        screen.queryByRole('list', {
          description: /Liste des résultats/,
        })
      ).not.toBeInTheDocument()
    })

    it("bloque la recherche tant que les champs n'ont pas changés", async () => {
      // Then
      expect(
        screen.getByRole('button', { name: 'Rechercher' })
      ).toHaveAttribute('disabled')
    })
  })

  //   describe('pagination', () => {
  //     beforeEach(() => {
  //       ;(immersionsService.searchImmersions as jest.Mock).mockImplementation(
  //         (_query, page) => ({
  //           metadonnees: { nombreTotal: 10, nombrePages: 4 },
  //           offres: [uneBaseImmersion({ titre: 'Offre page ' + page })],
  //         })
  //       )
  //     })
  //
  //     it('met à jour les offres avec la page demandée ', async () => {
  //       // When
  //       await userEvent.click(screen.getByLabelText('Page 2'))
  //
  //       // Then
  //       expect(immersionsService.searchImmersions).toHaveBeenCalledWith({})
  //       expect(screen.getByText('Offre page 2')).toBeInTheDocument()
  //     })
  //
  //     it('met à jour la page courante', async () => {
  //       // When
  //       await userEvent.click(screen.getByLabelText('Page suivante'))
  //       await userEvent.click(screen.getByLabelText('Page suivante'))
  //
  //       // Then
  //       expect(immersionsService.searchImmersions).toHaveBeenCalledWith({})
  //       expect(immersionsService.searchImmersions).toHaveBeenCalledWith({})
  //
  //       expect(screen.getByLabelText(`Page 3`)).toHaveAttribute(
  //         'aria-current',
  //         'page'
  //       )
  //     })
  //
  //     it('ne recharge pas la page courante', async () => {
  //       // When
  //       await userEvent.click(screen.getByLabelText(`Page 1`))
  //
  //       // Then
  //       expect(immersionsService.searchImmersions).toHaveBeenCalledTimes(1)
  //     })
  //   })
  // })
})

async function saisirMetier(text: string) {
  await userEvent.type(screen.getByLabelText(/Métier/), text)
  await act(() => new Promise((r) => setTimeout(r, 500)))
}

async function saisirCommune(text: string) {
  await userEvent.type(screen.getByLabelText(/Localisation/), text)
  await act(() => new Promise((r) => setTimeout(r, 500)))
}

function sanitize(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['-]/g, ' ')
    .toUpperCase()
}

import {
  act,
  fireEvent,
  RenderResult,
  screen,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import React from 'react'

import RechercheOffresPage from 'app/(connected)/(with-sidebar)/(with-chat)/offres/RechercheOffresPage'
import { listeBaseImmersions, uneBaseImmersion } from 'fixtures/offre'
import {
  desCommunes,
  desMetiers,
  uneCommune,
  unMetier,
} from 'fixtures/referentiel'
import { BaseImmersion } from 'interfaces/offre'
import { Commune, Metier } from 'interfaces/referentiel'
import { searchImmersions } from 'services/immersions.service'
import { getCommunes, getMetiers } from 'services/referentiel.service'
import { getByTextContent } from 'tests/querySelector'
import renderWithContexts from 'tests/renderWithContexts'

jest.mock('services/immersions.service')
jest.mock('services/referentiel.service')

describe('Page Recherche Immersions', () => {
  let immersions: BaseImmersion[]
  let metiers: Metier[]
  let communes: Commune[]

  let rendered: RenderResult
  beforeEach(async () => {
    metiers = desMetiers()
    communes = desCommunes()
    immersions = listeBaseImmersions()
    ;(searchImmersions as jest.Mock).mockResolvedValue({
      offres: immersions,
      metadonnees: { nombrePages: 4, nombreTotal: 37 },
    })
    ;(getMetiers as jest.Mock).mockResolvedValue(metiers)
    ;(getCommunes as jest.Mock).mockResolvedValue(communes)

    rendered = renderWithContexts(<RechercheOffresPage />, {})
    await userEvent.click(screen.getByRole('radio', { name: 'Immersion' }))
  })

  it('permet de definir des critères de recherche', () => {
    // Then
    const etape2 = screen.getByRole('group', {
      name: 'Étape 2: Critères de recherche',
    })

    expect(etape2).toBeInTheDocument()
    expect(
      within(etape2).getByRole('combobox', { name: /Métier/ })
    ).toHaveAttribute('aria-required')
    expect(
      within(etape2).getByRole('combobox', {
        name: /Localisation Saisissez une ville/,
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
      expect(getMetiers).toHaveBeenCalledTimes(1)
      expect(getMetiers).toHaveBeenCalledWith('DEVELOPPEUSE')
    })

    it('récupère les métiers à la saisie', async () => {
      // When
      await saisirMetier('Développeuse')

      // Then
      expect(getMetiers).toHaveBeenCalledTimes(1)
      expect(getMetiers).toHaveBeenCalledWith('DEVELOPPEUSE')
      expect(screen.getAllByRole('option', { hidden: true })).toHaveLength(
        metiers.length
      )
      metiers.forEach((metier) => {
        expect(
          screen.getByRole('option', {
            hidden: true,
            name: toUpperCaseAlpha(metier.libelle),
          })
        ).toHaveValue(toUpperCaseAlpha(metier.libelle))
      })
    })

    it('affiche une erreur quand le métier est incorrect', async () => {
      // Given
      const inputMetier = screen.getByLabelText(/Métier/)
      const submitButton = screen.getByRole('button', {
        name: 'Rechercher',
      })

      // When
      await userEvent.type(inputMetier, 'devlopr')

      await act(async () => {
        fireEvent.blur(inputMetier)
      })
      await userEvent.click(submitButton)

      // Then
      expect(
        screen.getByText(/Le champ “Métier“ est incorrect./)
      ).toBeInTheDocument()
      expect(searchImmersions).toHaveBeenCalledTimes(0)
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
      expect(getCommunes).toHaveBeenCalledTimes(1)
      expect(getCommunes).toHaveBeenCalledWith('L HAY LES ROSES')
    })

    it('récupère les communes à la saisie', async () => {
      // When
      await saisirCommune('Paris')

      // Then
      expect(getCommunes).toHaveBeenCalledTimes(1)
      expect(getCommunes).toHaveBeenCalledWith('PARIS')
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
      const submitButton = screen.getByRole('button', {
        name: 'Rechercher',
      })

      // When
      await saisirMetier('développeur / développeuse web')
      await saisirCommune('bout du monde')

      await userEvent.click(submitButton)

      // Then
      expect(
        screen.getByText(/Le champ “Localisation“ est incorrect./)
      ).toBeInTheDocument()
      expect(searchImmersions).toHaveBeenCalledTimes(0)
    })
  })

  describe('permet d’affiner la recherche par des filtres', () => {
    it('permet d’ajouter plus de filtre à la recherche', async () => {
      // Then
      expect(() =>
        screen.getByRole('group', { name: 'Étape 3: Plus de critères' })
      ).toThrow()
      expect(
        screen.getByRole('button', { name: 'Voir plus de critères' })
      ).toBeInTheDocument()

      // When
      await userEvent.click(screen.getByText('Voir plus de critères'))

      // Then
      const etape3 = screen.getByRole('group', {
        name: 'Étape 3: Plus de critères',
      })
      expect(etape3).toBeInTheDocument()
      expect(screen.getByText('Voir moins de critères')).toBeInTheDocument()
    })

    it('permet de définir un rayon de recherche si une commune est sélectionnée', async () => {
      // Given
      await userEvent.click(screen.getByText('Voir plus de critères'))
      const etape3 = screen.getByRole('group', {
        name: 'Étape 3: Plus de critères',
      })

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
      await saisirCommune('paris 14 (75)')
      fireEvent.change(screen.getByLabelText(/Dans un rayon de/), {
        target: { value: 43 },
      })
      expect(getByTextContent('Dans un rayon de : 43km')).toBeInTheDocument()
      expect(screen.getByText('[1] filtre sélectionné')).toBeInTheDocument()

      // When
      await userEvent.click(screen.getByText('Voir moins de critères'))
      await userEvent.click(screen.getByText('Voir plus de critères'))

      // Then
      expect(screen.getByLabelText(/rayon/)).toHaveValue('43')
    })
  })

  describe('partage des critères de recherche', () => {
    it('ne permet pas de partager s’il n’y a ni métier ni commune renseignés', async () => {
      await userEvent.click(
        screen.getByRole('button', {
          name: `Partager les critères de recherche`,
        })
      )

      expect(
        screen.getByText(
          'Pour suggérer des critères de recherche, vous devez saisir un métier et une ville.'
        )
      ).toBeInTheDocument()
    })

    it('affiche le bouton de partage de critère s’il y a un métier et une commune renseignés', async () => {
      // When
      await saisirMetier('développeur / développeuse web')
      await saisirCommune('paris 14 (75)')

      // Then
      expect(
        screen.getByText(
          'Suggérer ces critères de recherche à vos bénéficiaires'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', {
          name: `Partager les critères de recherche`,
        })
      ).toBeInTheDocument()
    })

    it('construit le bon lien qui correspond aux critères de recherches', async () => {
      // Given
      await saisirMetier('développeur / développeuse web')
      await saisirCommune('paris 14 (75)')

      // Then
      expect(
        screen.getByRole('link', {
          name: `Partager les critères de recherche`,
        })
      ).toHaveAttribute(
        'href',
        `/offres/immersion/partage-recherche?titre=D%C3%A9veloppeur%20/%20D%C3%A9veloppeuse%20web%20-%20PARIS%2014%20(75)&labelMetier=D%C3%A9veloppeur%20/%20D%C3%A9veloppeuse%20web&codeMetier=M1805&labelLocalite=PARIS%2014%20(75)&latitude=48.830108&longitude=2.323026`
      )
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
      expect(searchImmersions).toHaveBeenCalledTimes(0)
    })

    it('requiert le métier', async () => {
      // Given
      const submitButton = screen.getByRole('button', {
        name: 'Rechercher',
      })

      // When
      await saisirCommune('paris 14 (75)')
      await userEvent.click(submitButton)

      // Then
      expect(searchImmersions).toHaveBeenCalledTimes(0)
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
      expect(searchImmersions).toHaveBeenCalledTimes(0)
    })

    it('construit la recherche', async () => {
      // Given
      const submitButton = screen.getByRole('button', {
        name: 'Rechercher',
      })

      // When
      await saisirMetier('développeur / développeuse web')
      await saisirCommune('paris 14 (75)')
      await userEvent.click(submitButton)

      // Then
      expect(searchImmersions).toHaveBeenCalledWith(
        {
          commune: { value: uneCommune() },
          metier: { value: unMetier() },
          rayon: 10,
        },
        1
      )
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
      expect(searchImmersions).toHaveBeenCalledTimes(0)
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
      await saisirCommune('paris 14 (75)')
      await userEvent.click(submitButton)

      // Then
      offresList = screen.getByRole('list', {
        description: `Liste des résultats (37 offres)`,
      })
    })

    it('a11y', async () => {
      let results: AxeResults

      await act(async () => {
        results = await axe(rendered.container)
      })

      expect(results).toHaveNoViolations()
    })

    it('affiche les offres', async () => {
      expect(within(offresList).getAllByRole('listitem').length).toEqual(5)
    })

    it('affiche chaque offre', async () => {
      immersions.forEach((immersion) => {
        const immersionCard = within(offresList).getByRole('heading', {
          level: 3,
          name: immersion.titre,
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
        expect(
          within(immersionCard).getByRole('link', {
            name:
              'Voir le détail de l’offre chez ' + immersion.nomEtablissement,
          })
        ).toHaveAttribute('href', '/offres/immersion/' + immersion.id)
      })
    })

    it('permet de partager chaque offre', () => {
      immersions.forEach((offre) => {
        expect(
          within(offresList).getByRole('link', {
            name: `Partager offre chez ${offre.nomEtablissement}`,
          })
        ).toHaveAttribute('href', `/offres/immersion/${offre.id}/partage`)
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
      await saisirMetier('Designeuse')

      // Then
      expect(
        screen.queryByRole('list', {
          description: /Liste des résultats/,
        })
      ).not.toBeInTheDocument()
    })

    describe('pagination', () => {
      beforeEach(() => {
        ;(searchImmersions as jest.Mock).mockImplementation((_query, page) => ({
          metadonnees: { nombreTotal: 37, nombrePages: 4 },
          offres: [uneBaseImmersion({ titre: 'Immersion page ' + page })],
        }))
      })

      it('met à jour les offres avec la page demandée ', async () => {
        // When
        await userEvent.click(screen.getByLabelText('Page 2'))

        // Then
        expect(searchImmersions).toHaveBeenCalledWith(
          {
            commune: { value: uneCommune() },
            metier: { value: unMetier() },
            rayon: 10,
          },
          2
        )
        expect(screen.getByText('Immersion page 2')).toBeInTheDocument()
      })

      it('met à jour la page courante', async () => {
        // When
        await userEvent.click(screen.getByLabelText('Page suivante'))
        await userEvent.click(screen.getByLabelText('Page suivante'))

        // Then
        expect(searchImmersions).toHaveBeenCalledWith(
          {
            commune: { value: uneCommune() },
            metier: { value: unMetier() },
            rayon: 10,
          },
          2
        )
        expect(searchImmersions).toHaveBeenCalledWith(
          {
            commune: { value: uneCommune() },
            metier: { value: unMetier() },
            rayon: 10,
          },
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
        expect(searchImmersions).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('sauvegarde', () => {
    it('retient l’état de la recherche', async () => {
      // Given
      await saisirMetier('développeur / développeuse web')
      await saisirCommune('paris 14 (75)')
      await userEvent.click(screen.getByText('Voir plus de critères'))
      fireEvent.change(screen.getByLabelText(/Dans un rayon de/), {
        target: { value: 43 },
      })
      await userEvent.click(screen.getByRole('button', { name: 'Rechercher' }))
      await userEvent.click(screen.getByRole('button', { name: 'Page 2' }))

      // When
      rendered.unmount()
      renderWithContexts(<RechercheOffresPage />, {})

      // Then
      expect(screen.getByLabelText('Immersion')).toBeChecked()
      expect(screen.getByLabelText(/Métier/)).toHaveValue(
        'DEVELOPPEUR / DEVELOPPEUSE WEB'
      )
      expect(screen.getByLabelText(/Localisation/)).toHaveValue('PARIS 14 (75)')
      expect(screen.getByText('[1] filtre sélectionné')).toBeInTheDocument()
      await userEvent.click(screen.getByText('Voir plus de critères'))
      expect(screen.getByLabelText(/rayon/)).toHaveValue('43')
      const offresList = screen.getByRole('list', {
        description: 'Liste des résultats (37 offres)',
      })
      expect(within(offresList).getAllByRole('listitem').length).toEqual(
        immersions.length
      )
      expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute(
        'aria-current',
        'page'
      )
    })
  })
})

async function saisirMetier(text: string) {
  await userEvent.type(screen.getByLabelText(/Métier/), text)
  await act(() => new Promise((r) => setTimeout(r, 500)))
}

async function saisirCommune(text: string) {
  await userEvent.type(screen.getByLabelText(/Localisation/), text)
  await act(() => new Promise((r) => setTimeout(r, 500)))
}

function toUpperCaseAlpha(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['-]/g, ' ')
    .toUpperCase()
}

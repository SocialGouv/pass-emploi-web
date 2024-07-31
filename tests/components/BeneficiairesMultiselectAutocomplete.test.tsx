import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import BeneficiairesMultiselectAutocomplete, {
  OptionBeneficiaire,
} from 'components/jeune/BeneficiairesMultiselectAutocomplete'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import renderWithContexts from 'tests/renderWithContexts'

describe('BeneficiairesMultiselectAutocomplete', () => {
  let beneficiaires: OptionBeneficiaire[]
  let listes: ListeDeDiffusion[]
  let onUpdate: (selectedIds: {
    beneficiaires?: string[]
    listesDeDiffusion?: string[]
  }) => void

  let container: HTMLElement
  let input: HTMLElement
  let options: HTMLElement

  beforeEach(async () => {
    // Given
    beneficiaires = [
      { id: 'option-1', value: 'Option 1' },
      { id: 'option-2', value: 'Option 2' },
      { id: 'option-3', value: 'Option 3' },
    ]
    listes = [
      {
        id: 'liste-1',
        titre: 'Liste 1',
        beneficiaires: [
          {
            id: 'option-1',
            nom: 'Option',
            prenom: '1',
            estDansLePortefeuille: true,
          },
        ],
      },
      {
        id: 'liste-2',
        titre: 'Liste 2',
        beneficiaires: [
          {
            id: 'option-2',
            nom: 'Option',
            prenom: '2',
            estDansLePortefeuille: true,
          },
          {
            id: 'option-3',
            nom: 'Option',
            prenom: '3',
            estDansLePortefeuille: true,
          },
        ],
      },
    ]
    onUpdate = jest.fn()

    // When
    ;({ container } = renderWithContexts(
      <BeneficiairesMultiselectAutocomplete
        id='select-beneficiaires'
        beneficiaires={beneficiaires}
        listesDeDiffusion={listes}
        typeSelection='Bénéficiaires'
        onUpdate={onUpdate}
      />
    ))

    // Then
    input = screen.getByRole('combobox', {
      name: /Bénéficiaires/,
    })
  })

  it('render une combobox avec des options', async () => {
    // Then
    expect(input).toHaveAttribute('id', 'select-beneficiaires')
    expect(input).toHaveAttribute('multiple', '')
    expect(input).toHaveAttribute('list', 'select-beneficiaires--options')

    options = screen.getByRole('listbox', { hidden: true })
    expect(options).toHaveAttribute('id', 'select-beneficiaires--options')
  })

  it('permet de sélectionner les destinataires', async () => {
    // Then
    expect(
      within(options).getByRole('option', {
        name: 'Sélectionner tous mes destinataires',
        hidden: true,
      })
    ).toHaveValue('Sélectionner tous mes destinataires')

    beneficiaires.forEach((beneficiaire) => {
      expect(
        within(options).getByRole('option', {
          name: beneficiaire.value,
          hidden: true,
        })
      ).toHaveValue(beneficiaire.value)
    })
    listes.forEach((liste) => {
      expect(
        within(options).getByRole('option', {
          name: liste.titre + ' (' + liste.beneficiaires.length + ')',
          hidden: true,
        })
      ).toHaveValue(liste.titre + ' (' + liste.beneficiaires.length + ')')
    })
  })

  // TODO : ajouter prefixe pour les options des listes
  it('permet de sélectionner les listes de diffusion', async () => {
    // Then
    listes.forEach((liste) => {
      expect(
        within(options).getByRole('option', {
          name: `${liste.titre} (${liste.beneficiaires.length})`,
          hidden: true,
        })
      ).toHaveValue(`${liste.titre} (${liste.beneficiaires.length})`)
    })
  })

  it('a11y', async () => {
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  describe('sélection bénéficiaires', () => {
    beforeEach(async () => {
      // When
      await userEvent.type(input, 'Option 1')
      await userEvent.type(input, 'Option 3')
    })

    it('a11y', async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('affiche les bénéficiaires sélectionnés', async () => {
      // Then
      const selections = screen.getByRole('list', {
        name: 'Bénéficiaires sélectionnés (2)',
      })
      expect(within(selections).getByText('Option 1')).toBeInTheDocument()
      expect(within(selections).getByText('Option 3')).toBeInTheDocument()
    })

    it('transmet la selection du bénéficiaire', async () => {
      // Then
      expect(onUpdate).toHaveBeenCalledWith({
        beneficiaires: ['option-1'],
      })
      expect(onUpdate).toHaveBeenCalledWith({
        beneficiaires: ['option-3', 'option-1'],
      })
    })
  })

  describe('sélectionnes tous mes destinataires', () => {
    it('sélectionnes tous les destinataires d‘un coup', async () => {
      // When
      await userEvent.type(input, 'Sélectionner tous mes destinataires')

      // Then
      const selections = screen.getByRole('list', {
        name: 'Bénéficiaires sélectionnés (3)',
      })
      expect(within(selections).getByText('Option 1')).toBeInTheDocument()
      expect(within(selections).getByText('Option 2')).toBeInTheDocument()
      expect(within(selections).getByText('Option 3')).toBeInTheDocument()
      expect(onUpdate).toHaveBeenCalledWith({
        beneficiaires: ['option-1', 'option-2', 'option-3'],
      })
    })
  })

  describe('sélection liste', () => {
    beforeEach(async () => {
      // When
      await userEvent.type(input, 'Liste 2 (2)')
    })

    it('affiche la liste sélectionnée', async () => {
      // Then
      const selections = screen.getByRole('list', {
        name: 'Bénéficiaires sélectionnés (2)',
      })
      expect(within(selections).getByText('Liste 2 (2)')).toBeInTheDocument()
    })

    it('transmet la sélection de la liste', async () => {
      // Then
      expect(onUpdate).toHaveBeenCalledWith({ listesDeDiffusion: ['liste-2'] })
    })
  })

  describe('désélection bénéficiaires', () => {
    let selections: HTMLElement
    beforeEach(async () => {
      // Given
      await userEvent.type(input, 'Option 1')
      await userEvent.type(input, 'Option 3')
      selections = screen.getByRole('list', {
        name: 'Bénéficiaires sélectionnés (2)',
      })

      // When
      await userEvent.click(
        within(selections).getByRole('button', {
          name: /Enlever beneficiaire Option 1/,
        })
      )
    })

    it('enlève le bénéficiaire désélectionné', async () => {
      // Then
      expect(within(selections).queryByText('Option 1')).not.toBeInTheDocument()
      expect(within(selections).getByText('Option 3')).toBeInTheDocument()
    })

    it('transmet la déselection du bénéficiaire', async () => {
      // Then
      expect(onUpdate).toHaveBeenCalledWith({ beneficiaires: ['option-3'] })
    })
  })

  describe('désélection liste', () => {
    let selections: HTMLElement
    beforeEach(async () => {
      // Given
      await userEvent.type(input, 'Liste 1 (1)')
      await userEvent.type(input, 'Option 3')
      selections = screen.getByRole('list', {
        name: 'Bénéficiaires sélectionnés (2)',
      })

      // When
      await userEvent.click(
        within(selections).getByRole('button', {
          name: /Enlever beneficiaire Liste 1/,
        })
      )
    })

    it('enlève le bénéficiaire désélectionné', async () => {
      // Then
      expect(within(selections).queryByText('Liste 1')).not.toBeInTheDocument()
      expect(within(selections).getByText('Option 3')).toBeInTheDocument()
    })

    it('transmet la déselection du bénéficiaire', async () => {
      // Then
      expect(onUpdate).toHaveBeenCalledWith({ listesDeDiffusion: [] })
    })
  })
})

describe('quand le conseiller utilise Edge', () => {
  it('affiche un message d’erreur', () => {
    //Given
    const beneficiaires: OptionBeneficiaire[] = [
      { id: 'option-1', value: 'Option 1' },
      { id: 'option-2', value: 'Option 2' },
      { id: 'option-3', value: 'Option 3' },
    ]
    const listes: ListeDeDiffusion[] = [
      {
        id: 'liste-1',
        titre: 'Liste 1',
        beneficiaires: [
          {
            id: 'option-1',
            nom: 'Option',
            prenom: '1',
            estDansLePortefeuille: true,
          },
        ],
      },
      {
        id: 'liste-2',
        titre: 'Liste 2',
        beneficiaires: [
          {
            id: 'option-2',
            nom: 'Option',
            prenom: '2',
            estDansLePortefeuille: true,
          },
          {
            id: 'option-3',
            nom: 'Option',
            prenom: '3',
            estDansLePortefeuille: true,
          },
        ],
      },
    ]

    let onUpdate: (selectedIds: {
      beneficiaires?: string[]
      listesDeDiffusion?: string[]
    }) => void
    onUpdate = jest.fn()

    Object.defineProperty(window.navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.64',
      writable: true,
    })

    // When
    renderWithContexts(
      <BeneficiairesMultiselectAutocomplete
        id='select-beneficiaires'
        beneficiaires={beneficiaires}
        listesDeDiffusion={listes}
        typeSelection='Bénéficiaires'
        onUpdate={onUpdate}
      />
    )

    //Then
    expect(
      screen.getByText(/Nous recommandons l’usage de Firefox ou de Chrome./)
    ).toBeInTheDocument()
  })
})

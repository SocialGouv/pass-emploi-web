import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import BeneficiairesMultiselectAutocomplete, {
  OptionBeneficiaire,
} from 'components/jeune/BeneficiairesMultiselectAutocomplete'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'

describe('BeneficiairesMultiselectAutocomplete', () => {
  let beneficiaires: OptionBeneficiaire[]
  let listes: ListeDeDiffusion[]
  let onUpdate: (selectedIds: {
    beneficiaires?: string[]
    listesDeDiffusion?: string[]
  }) => void

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
    render(
      <BeneficiairesMultiselectAutocomplete
        beneficiaires={beneficiaires}
        listesDeDiffusion={listes}
        typeSelection='Bénéficiaires'
        onUpdate={onUpdate}
      />
    )

    // Then
    input = screen.getByRole('combobox', {
      name: 'Rechercher et ajouter des bénéficiaires Nom et prénom',
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

  it('permet de sélectionner les bénéficiaires', async () => {
    // Then
    expect(
      within(options).getByRole('option', {
        name: 'Sélectionner tous mes bénéficiaires',
        hidden: true,
      })
    ).toHaveValue('Sélectionner tous mes bénéficiaires')

    beneficiaires.forEach((beneficiaire) => {
      expect(
        within(options).getByRole('option', {
          name: beneficiaire.value,
          hidden: true,
        })
      ).toHaveValue(beneficiaire.value)
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

  describe('selection bénéficiaires', () => {
    beforeEach(async () => {
      // When
      await userEvent.type(input, 'Option 1')
      await userEvent.type(input, 'Option 3')
    })

    it('affiche les bénéficiaires sélectionnés', async () => {
      // Then
      const selections = screen.getByRole('region', {
        name: 'Bénéficiaires sélectionnés (2)',
      })
      expect(within(selections).getByText('Option 1')).toBeInTheDocument()
      expect(within(selections).getByText('Option 3')).toBeInTheDocument()
    })

    it('transmet la selection du bénéficiaire', async () => {
      // Then
      expect(onUpdate).toHaveBeenCalledWith({ beneficiaires: ['option-1'] })
      expect(onUpdate).toHaveBeenCalledWith({
        beneficiaires: ['option-1', 'option-3'],
      })
    })
  })

  describe('selection tous mes bénéficiaires', () => {
    it('sélectionnes tous les bénéficiaires d‘un coup', async () => {
      // When
      await userEvent.type(input, 'Sélectionner tous mes bénéficiaires')

      // Then
      const selections = screen.getByRole('region', {
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

  describe('selection liste', () => {
    beforeEach(async () => {
      // When
      await userEvent.type(input, 'Liste 2 (2)')
    })

    it('affiche la liste sélectionnée', async () => {
      // Then
      const selections = screen.getByRole('region', {
        name: 'Bénéficiaires sélectionnés (2)',
      })
      expect(within(selections).getByText('Liste 2 (2)')).toBeInTheDocument()
    })

    it('transmet la selection de la liste', async () => {
      // Then
      expect(onUpdate).toHaveBeenCalledWith({ listesDeDiffusion: ['liste-2'] })
    })
  })

  describe('déselection bénéficiaires', () => {
    let selections: HTMLElement
    beforeEach(async () => {
      // Given
      await userEvent.type(input, 'Option 1')
      await userEvent.type(input, 'Option 3')
      selections = screen.getByRole('region', {
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

  describe('déselection liste', () => {
    let selections: HTMLElement
    beforeEach(async () => {
      // Given
      await userEvent.type(input, 'Liste 1 (1)')
      await userEvent.type(input, 'Option 3')
      selections = screen.getByRole('region', {
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

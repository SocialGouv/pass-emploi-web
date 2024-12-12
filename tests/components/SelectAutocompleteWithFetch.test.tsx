import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import SelectAutocompleteWithFetch from 'components/ui/Form/SelectAutocompleteWithFetch'

type SearchedEntity = { idField: string; valueField: string }

describe('SelectAutocompleteWithFetch', () => {
  let fetchFunction: () => Promise<SearchedEntity[]>
  let onUpdateSelected: (value: {
    selected?: SearchedEntity
    hasError: boolean
  }) => void

  const getOptions = () => screen.getByRole('listbox', { hidden: true })
  const getSelect = () =>
    screen.getByRole('combobox', { name: 'Label autocomplete' })

  beforeEach(() => {
    // Given
    fetchFunction = jest.fn(async () => [
      { idField: 'valeur', valueField: 'valeur' },
      { idField: 'valeur-avec-tiret', valueField: 'valeur-avec-tiret' },
      { idField: 'valeur avec accent è', valueField: 'valeur avec accent è' },
      {
        idField: "valeur avec l'apostrophe",
        valueField: "valeur avec l'apostrophe",
      },
    ])
    onUpdateSelected = jest.fn()
  })

  describe('render', () => {
    beforeEach(() => {
      render(
        <>
          <label htmlFor='component'>Label autocomplete</label>
          <SelectAutocompleteWithFetch
            id='component'
            fetch={fetchFunction}
            fieldNames={{ id: 'idField', value: 'valueField' }}
            onUpdateSelected={onUpdateSelected}
            errorMessage='Error message'
          />
        </>
      )
    })

    it('contient une liste déroulante avec autocompletion', () => {
      // Then
      expect(getSelect()).toHaveAttribute('aria-autocomplete', 'list')
      expect(within(getOptions()).queryAllByRole('option')).toHaveLength(0)
    })

    it('récupère les données après 500ms', async () => {
      // When
      await userEvent.type(getSelect(), 'Rech')
      await userEvent.type(getSelect(), 'erche')
      await waitForDebounce(500)

      // Then
      expect(fetchFunction).toHaveBeenCalledTimes(1)
      expect(fetchFunction).toHaveBeenCalledWith('RECHERCHE')
    })

    it("construit une liste d'options en majuscule avec uniquement des caractères alphabétiques", async () => {
      // When
      await userEvent.type(getSelect(), 'valeur')
      await waitForDebounce(500)

      // Then
      expect(
        within(getOptions()).getByRole('option', {
          hidden: true,
          name: 'VALEUR',
        })
      ).toHaveValue('VALEUR')
      expect(
        within(getOptions()).getByRole('option', {
          hidden: true,
          name: 'VALEUR AVEC TIRET',
        })
      ).toHaveValue('VALEUR AVEC TIRET')
      expect(
        within(getOptions()).getByRole('option', {
          hidden: true,
          name: 'VALEUR AVEC ACCENT E',
        })
      ).toHaveValue('VALEUR AVEC ACCENT E')
      expect(
        within(getOptions()).getByRole('option', {
          hidden: true,
          name: 'VALEUR AVEC L APOSTROPHE',
        })
      ).toHaveValue('VALEUR AVEC L APOSTROPHE')
    })

    describe('quand on saisit une recherche', () => {
      it('nécessite une valeur correspondant à une option', async () => {
        // When
        await userEvent.type(getSelect(), 'pouet')

        // Then
        expect(onUpdateSelected).toHaveBeenCalledTimes('pouet'.length)
        expect(onUpdateSelected).toHaveBeenCalledWith({ hasError: true })
      })

      it('permet de vider le champ sans erreur', async () => {
        // When
        await userEvent.type(getSelect(), 'pouet')
        await userEvent.clear(getSelect())

        // Then
        expect(onUpdateSelected).toHaveBeenCalledTimes('pouet'.length + 1)
        expect(onUpdateSelected).toHaveBeenLastCalledWith({ hasError: false })
      })
    })

    describe('match option à la recherche', () => {
      it("sélectionne automatiquement l'option correspondant à la recherche", async () => {
        // When
        await userEvent.type(getSelect(), 'valeur-avec-tiret')
        await waitForDebounce(500)

        // Then
        expect(onUpdateSelected).toHaveBeenCalledTimes(
          'valeur-avec-tiret'.length + 1
        )
        expect(onUpdateSelected).toHaveBeenLastCalledWith({
          selected: {
            idField: 'valeur-avec-tiret',
            valueField: 'valeur-avec-tiret',
          },
          hasError: false,
        })
      })

      it('nécessite que le recherche corresponde à une option', async () => {
        // When
        await userEvent.type(getSelect(), 'valeu')
        await waitForDebounce(500)

        // Then
        expect(onUpdateSelected).toHaveBeenCalledTimes('valeu'.length + 1)
        expect(onUpdateSelected).toHaveBeenLastCalledWith({
          selected: undefined,
          hasError: true,
        })
      })
    })

    describe('quand on sélectionne une option dans la liste', () => {
      it("met à jour l'option sélectionnée", async () => {
        // Given
        await userEvent.type(getSelect(), 'valeu')
        await waitForDebounce(500)

        // When
        // FIXME cannot use .click : https://github.com/testing-library/user-event/issues/1073
        fireEvent.change(getSelect(), {
          target: { value: 'valeur avec accent è' },
        })
        await waitForDebounce(500)

        // Then
        expect(onUpdateSelected).toHaveBeenLastCalledWith({
          selected: {
            idField: 'valeur avec accent è',
            valueField: 'valeur avec accent è',
          },
          hasError: false,
        })
      })

      it("ne recharge pas les options si l'option sélectionnée est l'unique disponible", async () => {
        // Given
        await userEvent.type(getSelect(), 'valeur-avec-tiret')
        await waitForDebounce(500)
        expect(fetchFunction).toHaveBeenCalledTimes(1)
        ;(fetchFunction as jest.Mock).mockClear()

        // When
        fireEvent.change(getSelect(), {
          target: { value: 'VALEUR AVEC TIRET' },
        })

        // Then
        expect(fetchFunction).toHaveBeenCalledTimes(0)
      })
    })

    describe('quand on quitte le champ', () => {
      it('vérifie la validité de la saisie', async () => {
        // Given
        await userEvent.type(getSelect(), 'pouet')
        await waitForDebounce(500)

        // When
        getSelect().focus()
        await userEvent.tab()

        // Then
        expect(getSelect()).toHaveAttribute('aria-invalid')
        expect(getSelect()).toHaveAccessibleDescription('Error message')
      })
    })
  })

  describe('quand le champ est requis', () => {
    beforeEach(() => {
      render(
        <>
          <label htmlFor='component'>Label autocomplete</label>
          <SelectAutocompleteWithFetch
            id='component'
            fetch={fetchFunction}
            fieldNames={{ id: 'idField', value: 'valueField' }}
            onUpdateSelected={onUpdateSelected}
            errorMessage='Error message'
            required={true}
          />
        </>
      )
    })

    it('transmet une erreur quand le champ est vide', async () => {
      // When
      await userEvent.type(getSelect(), 'pouet')
      await userEvent.clear(getSelect())

      // Then
      expect(onUpdateSelected).toHaveBeenLastCalledWith({ hasError: true })
    })

    it('vérifie la présence de la saisie', async () => {
      // When
      await act(async () => {
        getSelect().focus()
        await userEvent.tab()
      })

      // Then
      expect(getSelect()).toHaveAttribute('aria-invalid')
      expect(getSelect()).toHaveAccessibleDescription('Error message')
    })
  })
})

async function waitForDebounce(ms: number): Promise<void> {
  await act(() => new Promise((r) => setTimeout(r, ms)))
}

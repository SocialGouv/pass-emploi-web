import { useCombobox, useMultipleSelection } from 'downshift'
import React, { useState } from 'react'
import AddIcon from '../../assets/icons/add-circled.svg'
import RemoveIcon from '../../assets/icons/remove.svg'
import { getJeuneFullname, Jeune } from '../../interfaces/jeune'

interface JeunesMultiselectAutocompleteProps {
  jeunes: Jeune[]
  onUpdate: (selection: Jeune[]) => void
  selectedLabel: string
}

export default function JeunesMultiselectAutocomplete({
  jeunes,
  onUpdate,
  selectedLabel,
}: JeunesMultiselectAutocompleteProps) {
  const [inputValue, setInputValue] = useState('')

  const {
    getSelectedItemProps,
    getDropdownProps,
    addSelectedItem,
    removeSelectedItem,
    selectedItems: selectedJeunes,
  } = useMultipleSelection({
    itemToString: getJeuneFullname,
    getA11yRemovalMessage: ({ itemToString, removedSelectedItem }) =>
      `${itemToString(removedSelectedItem)} a été enlevé.`,
  })

  function getFilteredJeunes() {
    return jeunes.filter(
      (j) =>
        selectedJeunes.indexOf(j) < 0 &&
        j.lastName.toLowerCase().startsWith(inputValue.toLowerCase())
    )
  }

  function selectJeune(jeune: Jeune) {
    setInputValue('')
    addSelectedItem(jeune)
    onUpdate(selectedJeunes)
  }

  function unselectJeune(jeune: Jeune) {
    removeSelectedItem(jeune)
    onUpdate(selectedJeunes)
  }

  const {
    isOpen,
    openMenu,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    inputValue,
    defaultHighlightedIndex: 0,
    selectedItem: null,
    items: getFilteredJeunes(),
    itemToString: (j: Jeune | null) => (j ? getJeuneFullname(j) : ''),
    getA11yStatusMessage: ({ resultCount }) => {
      if (resultCount < 1) return 'Aucun résultat disponible'
      let resultsText = '1 résultat disponible'
      if (resultCount > 1) return `${resultCount} résultats disponibles`
      return `${resultsText}, utilisez les touches directionnelles vers le haut et le bas pour naviguer. Appuyez sur Entrée pour sélectionner.`
    },
    getA11ySelectionMessage: ({ itemToString, selectedItem }) =>
      selectedItem ? `${itemToString(selectedItem)} a été sélectionné.` : '',
    onStateChange: ({ inputValue, type, selectedItem }) => {
      switch (type) {
        case useCombobox.stateChangeTypes.InputChange:
          setInputValue(inputValue ?? '')
          break
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          if (selectedItem) selectJeune(selectedItem)
          break
        default:
          break
      }
    },
  })

  return (
    <>
      <label {...getLabelProps()} className='text-base-medium'>
        <span aria-hidden='true'>*</span> Rechercher et ajouter des jeunes
        <span className='text-bleu_nuit text-sm-regular ml-2'>
          Nom et prénom
        </span>
      </label>

      <div {...getComboboxProps()} className='relative'>
        <input
          {...getInputProps({
            ...getDropdownProps({ preventKeyAction: isOpen }),
            onClick: () => {
              if (!isOpen) {
                openMenu()
              }
            },
          })}
          className={`text-sm text-bleu_nuit w-full p-3 mb-2 mt-4 border border-bleu_nuit cursor-pointer rounded-t-medium ${
            isOpen ? 'rounded-b-none' : 'rounded-b-medium'
          }`}
        />
        <ul
          {...getMenuProps()}
          className='max-h-96 overflow-y-auto absolute w-full bg-blanc shadow rounded-b-large'
        >
          {isOpen &&
            getFilteredJeunes().map((jeune, index) => (
              <li
                style={
                  highlightedIndex === index
                    ? { backgroundColor: '#EEF1F8' }
                    : {}
                }
                key={jeune.id}
                {...getItemProps({ item: jeune, index })}
                className='flex justify-between items-center px-6 py-2 border-solid border-0 border-b border-b-grey_500'
              >
                {jeune.lastName} {jeune.firstName}
                <AddIcon focusable={false} aria-hidden={true} />
              </li>
            ))}
        </ul>
      </div>

      <p
        aria-label={`${selectedLabel} sélectionnés (${selectedJeunes.length})`}
        className='mb-2'
      >
        {selectedLabel} ({selectedJeunes.length})
      </p>
      {selectedJeunes.length > 0 && (
        <ul className='bg-grey_100 rounded-[12px] px-2 py-4 max-h-96 overflow-y-auto'>
          {selectedJeunes.map((jeune, index) => (
            <li
              key={jeune.id}
              {...getSelectedItemProps({ selectedItem: jeune, index })}
              className='bg-blanc w-full rounded-full px-4 py-2 mb-2 last:mb-0 flex justify-between items-center'
            >
              {jeune.lastName} {jeune.firstName}
              <button
                type='reset'
                title='Enlever'
                onClick={() => unselectJeune(jeune)}
              >
                <span className='sr-only'>Enlever le jeune</span>
                <RemoveIcon focusable={false} aria-hidden={true} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

import { useRef, useState } from 'react'

import RemoveIcon from '../../assets/icons/remove.svg'

import SelectAutocomplete from 'components/ui/SelectAutocomplete'
import { getJeuneFullname, Jeune } from 'interfaces/jeune'

interface JeunesMultiselectAutocompleteProps {
  jeunes: Jeune[]
  typeSelection: string
  onUpdate: (selectedIds: string[]) => void
  defaultIds?: string[]
}

const SELECT_ALL_JEUNES_OPTION = 'Sélectionner tous mes jeunes'

interface OptionJeune {
  id: string
  value: string
}
export default function JeunesMultiselectAutocomplete({
  jeunes,
  onUpdate,
  typeSelection,
  defaultIds = [],
}: JeunesMultiselectAutocompleteProps) {
  const optionsJeunes: OptionJeune[] = jeunes.map((jeune) => ({
    id: jeune.id,
    value: getJeuneFullname(jeune),
  }))
  const [selectedJeunes, setSelectedJeunes] = useState<OptionJeune[]>(
    optionsJeunes.filter(({ id }) => defaultIds.includes(id))
  )
  const input = useRef<HTMLInputElement>(null)

  function getJeunesNotSelected(): OptionJeune[] {
    return optionsJeunes.filter(
      (jeune) => selectedJeunes.findIndex((j) => j.id === jeune.id) < 0
    )
  }

  function buildOptions(): OptionJeune[] {
    const jeunesNotSelected = getJeunesNotSelected()
    if (!jeunesNotSelected.length) return []
    return [
      { id: 'select-all-jeunes', value: SELECT_ALL_JEUNES_OPTION },
    ].concat(jeunesNotSelected)
  }

  function selectAllJeunes(): OptionJeune[] {
    return selectedJeunes.concat(getJeunesNotSelected())
  }

  function selectJeune(inputValue: string) {
    if (inputValue === SELECT_ALL_JEUNES_OPTION) {
      const updatedSelectedJeunes = selectAllJeunes()
      setSelectedJeunes(updatedSelectedJeunes)
      onUpdate(updatedSelectedJeunes.map((selected) => selected.id))
      input.current!.value = ''
    }

    const option = getJeunesNotSelected().find(
      ({ value }) =>
        value.localeCompare(inputValue, undefined, {
          sensitivity: 'base',
        }) === 0
    )
    if (option) {
      const updatedSelectedJeunes = selectedJeunes.concat(option)
      setSelectedJeunes(updatedSelectedJeunes)
      onUpdate(updatedSelectedJeunes.map((selected) => selected.id))
      input.current!.value = ''
    }
  }

  function unselectJeune(idJeune: string) {
    const indexSelectedJeune = selectedJeunes.findIndex((j) => j.id === idJeune)
    if (indexSelectedJeune > -1) {
      const updatedSelectedJeune = [...selectedJeunes]
      updatedSelectedJeune.splice(indexSelectedJeune, 1)
      setSelectedJeunes(updatedSelectedJeune)
      onUpdate(updatedSelectedJeune.map((selected) => selected.id))
    }
  }

  return (
    <>
      <label htmlFor='item-input' className='text-base-medium'>
        <span aria-hidden='true'>*</span> Rechercher et ajouter des jeunes
        <span className='text-sm-regular block'>Nom et prénom</span>
      </label>
      <SelectAutocomplete
        id='item-input'
        options={buildOptions()}
        onChange={(e) => selectJeune(e.target.value)}
        className='text-sm text-primary_darken w-full p-3 mb-2 mt-4 border border-content_color rounded-medium cursor-pointer bg-blanc disabled:border-disabled disabled:opacity-70'
        aria-required={true}
        multiple={true}
        aria-controls='selected-items'
        ref={input}
      />

      <p
        aria-label={`${typeSelection} sélectionnés (${selectedJeunes.length})`}
        id='items-label'
        className='text-base-medium mb-2'
        aria-live='polite'
      >
        {typeSelection} ({selectedJeunes.length})
      </p>
      {selectedJeunes.length > 0 && (
        <ul
          aria-labelledby='items-label'
          id='selected-items'
          role='region'
          className='bg-grey_100 rounded-[12px] px-2 py-4 max-h-96 overflow-y-auto'
          aria-live='polite'
          aria-relevant='additions removals'
        >
          {selectedJeunes.map(({ id, value }) => (
            <li
              key={id}
              className='bg-blanc w-full rounded-full px-4 py-2 mb-2 last:mb-0 flex justify-between items-center'
              aria-atomic={true}
            >
              {value}
              <button
                type='reset'
                title='Enlever'
                onClick={() => unselectJeune(id)}
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

import { useRef, useState } from 'react'

import RemoveIcon from '../../assets/icons/remove.svg'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { InputError } from 'components/ui/InputError'
import SelectAutocomplete from 'components/ui/SelectAutocomplete'
import { BaseJeune, getNomJeuneComplet } from 'interfaces/jeune'

interface JeunesMultiselectAutocompleteProps {
  jeunes: BaseJeune[]
  typeSelection: string
  onUpdate: (selectedIds: string[]) => void
  defaultJeunes?: OptionJeune[]
  error?: string
}

const SELECT_ALL_JEUNES_OPTION = 'Sélectionner tous mes jeunes'

export interface OptionJeune {
  id: string
  value: string
}

export default function JeunesMultiselectAutocomplete({
  jeunes,
  onUpdate,
  typeSelection,
  error,
  defaultJeunes = [],
}: JeunesMultiselectAutocompleteProps) {
  const optionsJeunes: OptionJeune[] = jeunes.map(jeuneToOption)
  const [selectedJeunes, setSelectedJeunes] =
    useState<OptionJeune[]>(defaultJeunes)
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

  function estJeuneDUnAutrePortefeuille(id: string): boolean {
    return !optionsJeunes.some((option) => option.id === id)
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
      <label htmlFor='select-jeunes' className='text-base-medium'>
        <span aria-hidden='true'>*</span> Rechercher et ajouter des jeunes
        <span className='text-s-regular block'>Nom et prénom</span>
      </label>
      {error && (
        <InputError id='select-jeunes--error' className='mt-2'>
          {error}
        </InputError>
      )}
      <SelectAutocomplete
        id='select-jeunes'
        options={buildOptions()}
        onChange={(e) => selectJeune(e.target.value)}
        className={`text-sm text-primary_darken w-full p-3 mb-2 mt-4 border rounded-medium cursor-pointer bg-blanc disabled:border-disabled disabled:opacity-70 ${
          error ? 'border-warning' : 'border-content_color'
        }`}
        aria-required={true}
        multiple={true}
        aria-controls='selected-jeunes'
        ref={input}
        aria-describedby='select-jeunes--error'
        aria-invalid={error ? true : undefined}
      />

      <p
        aria-label={`${typeSelection} sélectionnés (${selectedJeunes.length})`}
        id='selected-jeunes--title'
        className='text-base-medium mb-2'
        aria-live='polite'
      >
        {typeSelection} ({selectedJeunes.length})
      </p>
      {selectedJeunes.length > 0 && (
        <ul
          aria-labelledby='selected-jeunes--title'
          id='selected-jeunes'
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
              {estJeuneDUnAutrePortefeuille(id) && (
                <div className='flex items-center text-base-medium text-accent_3'>
                  <div
                    title="Ce jeune n'est pas dans votre portefeuille"
                    aria-label="Ce jeune n'est pas dans votre portefeuille"
                    className='mr-2'
                  >
                    <IconComponent
                      name={IconName.Info}
                      focusable={false}
                      aria-hidden={true}
                      className='w-6 h-6 fill-accent_3'
                    />
                  </div>
                  {value}
                </div>
              )}
              {!estJeuneDUnAutrePortefeuille(id) && value}

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

export function jeuneToOption(jeune: BaseJeune): OptionJeune {
  return {
    id: jeune.id,
    value: getNomJeuneComplet(jeune),
  }
}

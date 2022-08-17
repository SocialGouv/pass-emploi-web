import { useRef, useState } from 'react'

import { InputError } from 'components/ui/Form/InputError'
import Multiselection from 'components/ui/Form/Multiselection'
import SelectAutocomplete from 'components/ui/Form/SelectAutocomplete'
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
        className={`text-s-regular text-primary_darken w-full p-3 mb-2 mt-4 border rounded-medium cursor-pointer bg-blanc disabled:border-disabled disabled:opacity-70 ${
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
        <Multiselection
          selection={selectedJeunes.map(({ id, value }) => ({
            id,
            value,
            withInfo: estJeuneDUnAutrePortefeuille(id),
          }))}
          typeSelection='jeune'
          infoLabel={`Ce jeune n'est pas dans votre portefeuille`}
          unselect={unselectJeune}
        />
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

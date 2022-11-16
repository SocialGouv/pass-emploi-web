import { useRef, useState } from 'react'

import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import Multiselection from 'components/ui/Form/Multiselection'
import SelectAutocomplete from 'components/ui/Form/SelectAutocomplete'
import { BaseJeune, getNomJeuneComplet } from 'interfaces/jeune'

interface JeunesMultiselectAutocompleteProps {
  jeunes: Array<BaseJeune & { isAutrePortefeuille?: boolean }>
  typeSelection: string
  onUpdate: (selectedIds: string[]) => void
  required?: boolean
  defaultJeunes?: Array<BaseJeune & { isAutrePortefeuille?: boolean }>
  error?: string
}

const SELECT_ALL_JEUNES_OPTION = 'Sélectionner tous mes jeunes'

export interface OptionJeune {
  id: string
  value: string
  isAutrePortefeuille?: boolean
}

export default function JeunesMultiselectAutocomplete({
  jeunes,
  onUpdate,
  typeSelection,
  required = true,
  error,
  defaultJeunes = [],
}: JeunesMultiselectAutocompleteProps) {
  const optionsJeunes: OptionJeune[] = jeunes.map(jeuneToOption)
  const [selectedJeunes, setSelectedJeunes] = useState<OptionJeune[]>(
    defaultJeunes.map(jeuneToOption)
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
      {
        id: 'select-all-jeunes',
        value: SELECT_ALL_JEUNES_OPTION,
      },
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
      <Label htmlFor='select-jeunes' inputRequired={required}>
        {{
          main: 'Rechercher et ajouter des jeunes',
          helpText: 'Nom et prénom',
        }}
      </Label>
      {error && (
        <InputError id='select-jeunes--error' className='mt-2'>
          {error}
        </InputError>
      )}
      <SelectAutocomplete
        id='select-jeunes'
        options={buildOptions()}
        onChange={(value: string) => selectJeune(value)}
        required={required}
        multiple={true}
        aria-controls='selected-jeunes'
        ref={input}
        invalid={Boolean(error)}
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
          selection={selectedJeunes.map(
            ({ id, value, isAutrePortefeuille }) => ({
              id,
              value,
              withInfo: Boolean(isAutrePortefeuille),
            })
          )}
          typeSelection='jeune'
          infoLabel={`Ce jeune n'est pas dans votre portefeuille`}
          unselect={unselectJeune}
        />
      )}
    </>
  )
}

function jeuneToOption(
  jeune: BaseJeune & { isAutrePortefeuille?: boolean }
): OptionJeune {
  return {
    id: jeune.id,
    value: getNomJeuneComplet(jeune),
    isAutrePortefeuille: jeune.isAutrePortefeuille,
  }
}

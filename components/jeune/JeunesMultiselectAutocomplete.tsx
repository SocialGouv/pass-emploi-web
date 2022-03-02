import { getJeuneFullname, Jeune } from 'interfaces/jeune'
import React, { useRef, useState } from 'react'
import RemoveIcon from '../../assets/icons/remove.svg'

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
  const [selectedJeunes, setSelectedJeunes] = useState<Jeune[]>([])
  const input = useRef<HTMLInputElement>(null)

  function getJeunesNotSelected(): Jeune[] {
    return jeunes.filter(
      (jeune) => selectedJeunes.findIndex((j) => j.id === jeune.id) < 0
    )
  }

  function selectJeune(inputValue: string) {
    const jeune = getJeunesNotSelected().find(
      (j) => getJeuneFullname(j) === inputValue
    )
    if (jeune) {
      const updatedSelectedJeunes = selectedJeunes.concat(jeune)
      setSelectedJeunes(updatedSelectedJeunes)
      onUpdate(updatedSelectedJeunes)
      input.current!.value = ''
    }
  }

  function unselectJeune(idJeune: string) {
    const indexSelectedJeune = selectedJeunes.findIndex((j) => j.id === idJeune)
    if (indexSelectedJeune > -1) {
      const updatedSelectedJeune = [...selectedJeunes]
      updatedSelectedJeune.splice(indexSelectedJeune, 1)
      setSelectedJeunes(updatedSelectedJeune)
      onUpdate(updatedSelectedJeune)
    }
  }

  return (
    <>
      <label htmlFor='item-input' className='text-base-medium'>
        <span aria-hidden='true'>*</span> Rechercher et ajouter des jeunes
        <p className='text-bleu_nuit text-sm-regular'>Nom et prénom</p>
      </label>
      <input
        type='text'
        id='item-input'
        name='item'
        ref={input}
        className='text-sm text-bleu_nuit w-full p-3 mb-2 mt-4 border border-bleu_nuit rounded-medium cursor-pointer bg-blanc'
        list='items'
        onChange={(e) => selectJeune(e.target.value)}
        multiple={true}
        aria-controls='selected-items'
      />
      <datalist id='items'>
        {getJeunesNotSelected().map((jeune) => (
          <option key={jeune.id} value={getJeuneFullname(jeune)} />
        ))}
      </datalist>

      <p
        aria-label={`${selectedLabel} sélectionnés (${selectedJeunes.length})`}
        className='mb-2'
        id='selected-label'
      >
        {selectedLabel} ({selectedJeunes.length})
      </p>
      {selectedJeunes.length > 0 && (
        <ul
          id='selected-items'
          role='region'
          className='bg-grey_100 rounded-[12px] px-2 py-4'
          aria-labelledby='selected-label'
          aria-live='polite'
          aria-relevant='all'
        >
          {selectedJeunes.map((jeune) => (
            <li
              key={jeune.id}
              className='bg-blanc w-full rounded-full px-4 py-2 mb-2 last:mb-0 flex justify-between items-center'
            >
              {getJeuneFullname(jeune)}
              <button
                type='reset'
                title='Enlever'
                onClick={() => unselectJeune(jeune.id)}
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

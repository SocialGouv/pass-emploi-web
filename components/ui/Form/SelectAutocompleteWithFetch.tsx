import React, { useEffect, useMemo, useState } from 'react'

import { InputError } from 'components/ui/Form/InputError'
import SelectAutocomplete from 'components/ui/Form/SelectAutocomplete'
import { useDebounce } from 'utils/hooks/useDebounce'

type SelectAutocompleteWithFetchProps<T> = {
  id: string
  fetch: (search: string) => Promise<T[]>
  fieldNames: { id: string; value: string }
  onUpdateSelected: (value: { selected?: T; hasError: boolean }) => void
  errorMessage: string
  value?: string
  required?: boolean
}
export default function SelectAutocompleteWithFetch<T>({
  id,
  fetch,
  fieldNames,
  onUpdateSelected,
  errorMessage,
  value = '',
  required,
}: SelectAutocompleteWithFetchProps<T>) {
  const [entites, setEntites] = useState<T[]>([])
  const options: Array<{ id: string; value: string }> = useMemo(
    () =>
      entites.map((entite) => ({
        id: (entite as any)[fieldNames.id],
        value: (entite as any)[fieldNames.value],
      })),
    [entites]
  )
  const [input, setInput] = useState<{ value?: string; error?: string }>({
    value,
  })
  const debouncedInput = useDebounce(input.value, 500)

  function handleInputChange(str: string) {
    setInput({
      value: str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
    })
    onUpdateSelected({ selected: undefined, hasError: Boolean(str) })
  }

  function updateSelected(selected: T | undefined) {
    onUpdateSelected({ selected, hasError: !selected })
  }

  function validateSelected() {
    if (!input.value) return
    if (input.value) {
      const entiteCorrespondante = findEntiteInListe(input.value, entites)
      if (!entiteCorrespondante) {
        setInput({ ...input, error: errorMessage })
      }
    }
  }

  function findEntiteInListe(str: string, liste: T[]): T | undefined {
    return liste.find(
      (entite) =>
        (entite as any)[fieldNames.value].localeCompare(str, undefined, {
          sensitivity: 'base',
        }) === 0
    )
  }

  useEffect(() => {
    if (debouncedInput) {
      fetch(debouncedInput).then((newEntites) => {
        setEntites(newEntites)
        updateSelected(findEntiteInListe(debouncedInput, newEntites))
      })
    } else {
      setEntites([])
    }
  }, [debouncedInput])

  return (
    <>
      {input.error && (
        <InputError id={id + '--error'}>{input.error}</InputError>
      )}
      <SelectAutocomplete
        id={id}
        options={options}
        onChange={handleInputChange}
        onBlur={validateSelected}
        invalid={Boolean(input.error)}
        value={input.value ?? ''}
        required={required}
      />
    </>
  )
}

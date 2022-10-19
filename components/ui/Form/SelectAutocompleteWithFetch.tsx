import React, { useEffect, useMemo, useState } from 'react'

import { InputError } from 'components/ui/Form/InputError'
import SelectAutocomplete from 'components/ui/Form/SelectAutocomplete'
import { useDebounce } from 'utils/hooks/useDebounce'

type WithSanitized<T> = T & { sanitized: string }
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
  const [entites, setEntites] = useState<WithSanitized<T>[]>([])
  const options: Array<{ id: string; value: string }> = useMemo(
    () =>
      entites.map((entite) => ({
        id: (entite as any)[fieldNames.id],
        value: entite.sanitized,
      })),
    [entites]
  )
  const [input, setInput] = useState<{ value?: string; error?: string }>({
    value: value && sanitize(value),
  })
  const debouncedInput = useDebounce(input.value, 500)

  function handleInputChange(str: string) {
    setInput({ value: sanitize(str) })
    onUpdateSelected({ hasError: Boolean(str) })
  }

  function validateSelected() {
    if (!input.value && !required) return
    if (!input.value) setInput({ ...input, error: errorMessage })
    if (input.value) {
      const entiteCorrespondante = findEntiteInListe(input.value, entites)
      if (!entiteCorrespondante) {
        setInput({ ...input, error: errorMessage })
      }
    }
  }

  function findEntiteInListe(
    str: string,
    liste: WithSanitized<T>[]
  ): T | undefined {
    const entiteWithSanitized = liste.find((entite) => entite.sanitized === str)
    if (entiteWithSanitized) {
      const { sanitized, ...entite } = entiteWithSanitized
      return entite as T
    }
  }

  useEffect(() => {
    if (debouncedInput) {
      fetch(debouncedInput).then((newEntites) => {
        const sanitizedEntities = newEntites.map((e) => ({
          ...e,
          sanitized: sanitize((e as any)[fieldNames.value]),
        }))
        setEntites(sanitizedEntities)
        const entite = findEntiteInListe(debouncedInput, sanitizedEntities)
        onUpdateSelected({ selected: entite, hasError: !entite })
      })
    } else {
      setEntites([])
      onUpdateSelected({ hasError: Boolean(required) })
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

function sanitize(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['-]/g, ' ')
    .toUpperCase()
}

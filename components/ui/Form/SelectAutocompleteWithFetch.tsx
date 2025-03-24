import React, { useEffect, useRef, useState } from 'react'

import InputError from 'components/ui/Form/InputError'
import SelectAutocomplete from 'components/ui/Form/SelectAutocomplete'
import { useDebounce } from 'utils/hooks/useDebounce'

type WithSimplifiedLabel<T> = T & { upperCaseAlphaLabel: string }

type PickStringFields<T> = {
  [P in keyof T as T[P] extends string ? P : never]: T[P]
}
type SelectAutocompleteWithFetchProps<T> = {
  id: string
  fetch: (search: string) => Promise<T[]>
  fieldNames: {
    id: keyof PickStringFields<T>
    value: keyof PickStringFields<T>
  }
  onUpdateSelected: (value: { selected?: T; hasError: boolean }) => void
  errorMessage: string
  defaultValue?: string
  required?: boolean
  disabled?: boolean
}
export default function SelectAutocompleteWithFetch<T>({
  id,
  fetch,
  fieldNames,
  onUpdateSelected,
  errorMessage,
  defaultValue,
  required,
  disabled = false,
}: SelectAutocompleteWithFetchProps<T>) {
  const isFirstRender = useRef<boolean>(true)

  const [entites, setEntites] = useState<WithSimplifiedLabel<T>[]>([])
  const options: Array<{ id: string; value: string }> = entites.map(
    (entite) => ({
      id: entite[fieldNames.id] as string,
      value: entite.upperCaseAlphaLabel,
    })
  )
  const [input, setInput] = useState<{ value?: string; error?: string }>({
    value: defaultValue && toUpperCaseAlpha(defaultValue),
  })
  const debouncedInput = useDebounce(input.value, 500)

  function handleInputChange(str: string) {
    setInput({ value: toUpperCaseAlpha(str) })
    onUpdateSelected({ hasError: Boolean(str || required) })
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
    liste: WithSimplifiedLabel<T>[]
  ): T | undefined {
    const entiteWithSimplifiedLabel = liste.find(
      (entite) => entite.upperCaseAlphaLabel === str
    )
    if (entiteWithSimplifiedLabel) {
      const { upperCaseAlphaLabel, ...entite } = entiteWithSimplifiedLabel
      return entite as T
    }
  }

  useEffect(() => {
    if (isFirstRender.current) return

    if (debouncedInput) {
      fetch(debouncedInput).then((newEntites) => {
        const simplifiedEntities: WithSimplifiedLabel<T>[] = newEntites.map(
          (e) => ({
            ...e,
            upperCaseAlphaLabel: toUpperCaseAlpha(
              e[fieldNames.value] as string
            ),
          })
        )
        setEntites(simplifiedEntities)
        const entite = findEntiteInListe(debouncedInput, simplifiedEntities)
        onUpdateSelected({ selected: entite, hasError: !entite })
      })
    } else {
      setEntites([])
      onUpdateSelected({ hasError: Boolean(required) })
    }
  }, [debouncedInput])

  useEffect(() => {
    isFirstRender.current = false
    return () => {
      isFirstRender.current = true
    }
  }, [])

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
        disabled={disabled}
      />
    </>
  )
}

function toUpperCaseAlpha(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['-]/g, ' ')
    .toUpperCase()
}

import React, { useEffect, useMemo, useState } from 'react'

import { InputError } from 'components/ui/Form/InputError'
import SelectAutocomplete from 'components/ui/Form/SelectAutocomplete'
import { Localite } from 'interfaces/referentiel'
import { useDebounce } from 'utils/hooks/useDebounce'

type LocaliteSelectAutocompleteProps = {
  fetchLocalites: (search: string) => Promise<Localite[]>
  onUpdateLocalite: (value: {
    localite: Localite | undefined
    hasError: boolean
  }) => void
  value?: string
}
export default function LocaliteSelectAutocomplete({
  fetchLocalites,
  onUpdateLocalite,
  value,
}: LocaliteSelectAutocompleteProps) {
  const [localites, setLocalites] = useState<Localite[]>([])
  const localitesOptions = useMemo(
    () => localites.map(({ code, libelle }) => ({ id: code, value: libelle })),
    [localites]
  )
  const [localisationInput, setLocalisationInput] = useState<{
    value?: string
    error?: string
  }>({ value })
  const debouncedLocalisationInput = useDebounce(localisationInput.value, 500)

  function handleLocalisationInputChanges(str: string) {
    setLocalisationInput({
      value: str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
    })
    onUpdateLocalite({ localite: undefined, hasError: Boolean(str) })
  }

  function updateLocalite(localite: Localite | undefined) {
    onUpdateLocalite({ localite, hasError: !localite })
  }

  function validateLocalite() {
    if (!localisationInput.value) return

    const localiteCorrespondante = findLocaliteInListe(
      localisationInput.value,
      localites
    )
    if (!localiteCorrespondante) {
      setLocalisationInput({
        ...localisationInput,
        error: 'Veuillez saisir une localisation correcte.',
      })
    }
  }

  function findLocaliteInListe(
    str: string,
    liste: Localite[]
  ): Localite | undefined {
    return liste.find(
      ({ libelle }) =>
        libelle.localeCompare(str, undefined, {
          sensitivity: 'base',
        }) === 0
    )
  }

  useEffect(() => {
    if (debouncedLocalisationInput) {
      fetchLocalites(debouncedLocalisationInput).then((newLocalites) => {
        setLocalites(newLocalites)
        updateLocalite(
          findLocaliteInListe(debouncedLocalisationInput, newLocalites)
        )
      })
    } else {
      setLocalites([])
    }
  }, [debouncedLocalisationInput])

  return (
    <>
      {localisationInput.error && (
        <InputError id='localisation--error'>
          {localisationInput.error}
        </InputError>
      )}
      <SelectAutocomplete
        id='localisation'
        options={localitesOptions}
        onChange={handleLocalisationInputChanges}
        onBlur={validateLocalite}
        invalid={Boolean(localisationInput.error)}
        value={localisationInput.value ?? ''}
      />
    </>
  )
}

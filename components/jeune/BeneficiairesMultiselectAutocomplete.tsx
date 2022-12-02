import { useRef, useState } from 'react'

import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import Multiselection from 'components/ui/Form/Multiselection'
import SelectAutocomplete from 'components/ui/Form/SelectAutocomplete'

interface BeneficiairesMultiselectAutocompleteProps {
  beneficiaires: OptionBeneficiaire[]
  typeSelection: string
  onUpdate: (selectedIds: string[]) => void
  required?: boolean
  defaultBeneficiaires?: OptionBeneficiaire[]
  error?: string
  disabled?: boolean
  renderIndication?: (props: { value: string }) => JSX.Element
}

const SELECT_ALL_BENEFICIAIRES_OPTION = 'Sélectionner tous mes bénéficiaires'

export interface OptionBeneficiaire {
  id: string
  value: string
  avecIndication?: boolean
}

export default function BeneficiairesMultiselectAutocomplete({
  beneficiaires,
  onUpdate,
  typeSelection,
  required = true,
  error,
  defaultBeneficiaires = [],
  disabled,
  renderIndication,
}: BeneficiairesMultiselectAutocompleteProps) {
  const [beneficiairesSelectionnes, setBeneficiairesSelectionnes] =
    useState<OptionBeneficiaire[]>(defaultBeneficiaires)
  const input = useRef<HTMLInputElement>(null)

  function getBeneficiairesNonSelectionnes(): OptionBeneficiaire[] {
    return beneficiaires.filter(
      (benef) =>
        beneficiairesSelectionnes.findIndex((j) => j.id === benef.id) < 0
    )
  }

  function buildOptions(): OptionBeneficiaire[] {
    const beneficiairesNonSelectionnes = getBeneficiairesNonSelectionnes()
    if (!beneficiairesNonSelectionnes.length) return []
    return [
      {
        id: 'select-all-beneficiaires',
        value: SELECT_ALL_BENEFICIAIRES_OPTION,
      },
    ].concat(beneficiairesNonSelectionnes)
  }

  function selectAllBeneficiaires(): OptionBeneficiaire[] {
    return beneficiairesSelectionnes.concat(getBeneficiairesNonSelectionnes())
  }

  function selectBeneficiaire(inputValue: string) {
    if (disabled) return

    if (inputValue === SELECT_ALL_BENEFICIAIRES_OPTION) {
      const updatedBeneficiairesSelectionnes = selectAllBeneficiaires()
      setBeneficiairesSelectionnes(updatedBeneficiairesSelectionnes)
      onUpdate(updatedBeneficiairesSelectionnes.map((selected) => selected.id))
      input.current!.value = ''
      return
    }

    const option = getBeneficiairesNonSelectionnes().find(
      ({ value }) =>
        value.localeCompare(inputValue, undefined, {
          sensitivity: 'base',
        }) === 0
    )
    if (option) {
      const updatedBeneficiairesSelectionnes =
        beneficiairesSelectionnes.concat(option)
      setBeneficiairesSelectionnes(updatedBeneficiairesSelectionnes)
      onUpdate(updatedBeneficiairesSelectionnes.map((selected) => selected.id))
      input.current!.value = ''
    }
  }

  function deselectionnerBeneficiaire(idBeneficiaire: string) {
    if (disabled) return

    const indexBeneficiaire = beneficiairesSelectionnes.findIndex(
      (j) => j.id === idBeneficiaire
    )
    if (indexBeneficiaire > -1) {
      const updatedBeneficiairesSelectionnes = [...beneficiairesSelectionnes]
      updatedBeneficiairesSelectionnes.splice(indexBeneficiaire, 1)
      setBeneficiairesSelectionnes(updatedBeneficiairesSelectionnes)
      onUpdate(updatedBeneficiairesSelectionnes.map((selected) => selected.id))
    }
  }

  return (
    <>
      <Label htmlFor='select-beneficiaires' inputRequired={required}>
        {{
          main: 'Rechercher et ajouter des bénéficiaires',
          helpText: 'Nom et prénom',
        }}
      </Label>
      {error && (
        <InputError id='select-beneficiaires--error' className='mt-2'>
          {error}
        </InputError>
      )}
      <SelectAutocomplete
        id='select-beneficiaires'
        options={buildOptions()}
        onChange={(value: string) => selectBeneficiaire(value)}
        required={required}
        multiple={true}
        aria-controls='selected-beneficiaires'
        ref={input}
        invalid={Boolean(error)}
        disabled={disabled}
      />

      <p
        aria-label={`${typeSelection} sélectionnés (${beneficiairesSelectionnes.length})`}
        id='selected-beneficiaires--title'
        className='text-base-medium mb-2'
        aria-live='polite'
      >
        {typeSelection} ({beneficiairesSelectionnes.length})
      </p>
      {beneficiairesSelectionnes.length > 0 && (
        <Multiselection
          selection={beneficiairesSelectionnes.map(
            ({ id, value, avecIndication = false }) => ({
              id,
              value,
              avecIndication: avecIndication,
            })
          )}
          typeSelection='beneficiaire'
          unselect={deselectionnerBeneficiaire}
          renderIndication={renderIndication}
          disabled={disabled}
        />
      )}
    </>
  )
}

import { useRef, useState } from 'react'

import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import Multiselection from 'components/ui/Form/Multiselection'
import SelectAutocomplete from 'components/ui/Form/SelectAutocomplete'
import {
  getInformationsListe,
  ListeDeDiffusion,
} from 'interfaces/liste-de-diffusion'

interface BeneficiairesMultiselectAutocompleteProps {
  id: string
  beneficiaires: OptionBeneficiaire[]
  listesDeDiffusion?: ListeDeDiffusion[]
  typeSelection: string
  onUpdate: (selectedIds: {
    beneficiaires?: string[]
    listesDeDiffusion?: string[]
  }) => void
  required?: boolean
  defaultBeneficiaires?: OptionBeneficiaire[]
  error?: string
  disabled?: boolean
  renderIndication?: (props: { value: string }) => JSX.Element
  ariaDescribedBy?: string
}

const SELECT_ALL_DESTINATAIRES_OPTION = 'Sélectionner tous mes destinataires'

export interface OptionBeneficiaire {
  id: string
  value: string
  avecIndication?: boolean
  estUneListe?: boolean
}

export default function BeneficiairesMultiselectAutocomplete({
  id,
  beneficiaires,
  listesDeDiffusion = [],
  onUpdate,
  typeSelection,
  required = true,
  error,
  defaultBeneficiaires = [],
  disabled,
  renderIndication,
  ariaDescribedBy,
}: BeneficiairesMultiselectAutocompleteProps) {
  const options = listesDeDiffusion
    .map(
      (liste) =>
        ({
          id: liste.id,
          value: getInformationsListe(liste),
          estUneListe: true,
        } as OptionBeneficiaire)
    )
    .concat(beneficiaires)

  const [selections, setSelections] =
    useState<OptionBeneficiaire[]>(defaultBeneficiaires)
  const input = useRef<HTMLInputElement>(null)

  function getOptionsNonSelectionnees(): OptionBeneficiaire[] {
    return options.filter(
      (option) => !selections.some((selection) => selection.id === option.id)
    )
  }

  function rechercherUneOption(inputValue: string) {
    return getOptionsNonSelectionnees().find(
      ({ value }) =>
        value.localeCompare(inputValue, undefined, {
          sensitivity: 'base',
        }) === 0
    )
  }

  function buildOptions(): OptionBeneficiaire[] {
    return [
      {
        id: 'select-all-destinataires',
        value: SELECT_ALL_DESTINATAIRES_OPTION,
      },
    ].concat(getOptionsNonSelectionnees())
  }

  function selectionnerOption(inputValue: string) {
    if (disabled) return

    if (inputValue === SELECT_ALL_DESTINATAIRES_OPTION) {
      setSelections(beneficiaires)
      onUpdate({
        beneficiaires: beneficiaires.map((option) => option.id),
      })
      input.current!.value = ''
      return
    }

    const optionSelectionnee = rechercherUneOption(inputValue)

    if (optionSelectionnee) {
      const updatedSelections = [optionSelectionnee, ...selections]
      setSelections(updatedSelections)

      if (optionSelectionnee.estUneListe) {
        onUpdate({
          listesDeDiffusion: updatedSelections
            .filter((selection) => selection.estUneListe)
            .map((liste) => liste.id),
        })
      } else {
        onUpdate({
          beneficiaires: updatedSelections
            .filter((selection) => !selection.estUneListe)
            .map((beneficiaire) => beneficiaire.id),
        })
      }

      input.current!.value = ''
    }
  }

  function deselectionnerOption(idOption: string) {
    if (disabled) return

    const indexOption = selections.findIndex(
      (selection) => selection.id === idOption
    )
    if (indexOption > -1) {
      const option = selections[indexOption]
      const updatedSelections = [...selections]
      updatedSelections.splice(indexOption, 1)
      setSelections(updatedSelections)

      if (option.estUneListe) {
        onUpdate({
          listesDeDiffusion: updatedSelections
            .filter((selection) => selection.estUneListe)
            .map((liste) => liste.id),
        })
      } else {
        onUpdate({
          beneficiaires: updatedSelections
            .filter((selection) => !selection.estUneListe)
            .map((beneficiaire) => beneficiaire.id),
        })
      }
    }
  }

  function optionsSelectionnees() {
    return selections.map((selection) => ({
      id: selection.id,
      value: selection.value,
      estUneListe: selection.estUneListe ?? false,
      avecIndication: selection.avecIndication ?? false,
    }))
  }

  function countBeneficiairesUniques() {
    const idsBeneficiaires = selections.flatMap((selection) => {
      if (selection.estUneListe)
        return listesDeDiffusion
          .find((liste) => liste.id === selection.id)!
          .beneficiaires.map((beneficiaire) => beneficiaire.id)
      return selection.id
    })

    return new Set(idsBeneficiaires).size
  }

  function getHelpText() {
    return listesDeDiffusion?.length > 0
      ? 'Nom et prénom du bénéficiaire ou nom de votre liste de diffusion'
      : 'Nom et prénom'
  }

  return (
    <>
      <Label htmlFor={id} inputRequired={required}>
        {{
          main: 'Rechercher et ajouter des destinataires',
          helpText: getHelpText(),
        }}
      </Label>
      {error && (
        <InputError id={id + '--error'} className='mt-2'>
          {error}
        </InputError>
      )}
      <SelectAutocomplete
        id={id}
        options={buildOptions()}
        onChange={(value: string) => selectionnerOption(value)}
        required={required}
        multiple={true}
        aria-controls='selected-beneficiaires'
        ref={input}
        invalid={Boolean(error)}
        disabled={disabled}
        ariaDescribedBy={ariaDescribedBy}
      />

      <p
        aria-label={`${typeSelection} sélectionnés (${countBeneficiairesUniques()})`}
        id='selected-beneficiaires--title'
        className='text-base-medium mb-2'
        aria-live='polite'
      >
        {typeSelection} ({countBeneficiairesUniques()})
      </p>

      {selections.length > 0 && (
        <Multiselection
          selection={optionsSelectionnees()}
          typeSelection='beneficiaire'
          unselect={deselectionnerOption}
          renderIndication={renderIndication}
          disabled={disabled}
        />
      )}
    </>
  )
}

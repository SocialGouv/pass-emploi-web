import { useRef, useState } from 'react'

import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import Multiselection from 'components/ui/Form/Multiselection'
import SelectAutocomplete from 'components/ui/Form/SelectAutocomplete'
import {
  getListeInformations,
  ListeDeDiffusion,
} from 'interfaces/liste-de-diffusion'

interface BeneficiairesMultiselectAutocompleteProps {
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
}

const SELECT_ALL_BENEFICIAIRES_OPTION = 'Sélectionner tous mes bénéficiaires'

export interface OptionBeneficiaire {
  id: string
  value: string
  avecIndication?: boolean
  estUneListe?: boolean
}

export default function BeneficiairesMultiselectAutocomplete({
  beneficiaires,
  listesDeDiffusion = [],
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
  const [listesSelectionnes, setListesSelectionnes] = useState<
    ListeDeDiffusion[]
  >([])
  const input = useRef<HTMLInputElement>(null)

  function getBeneficiairesNonSelectionnes(): OptionBeneficiaire[] {
    return beneficiaires.filter(
      (benef) =>
        beneficiairesSelectionnes.findIndex((j) => j.id === benef.id) < 0
    )
  }

  function getListesDeDiffusionNonSelectionnes(): OptionBeneficiaire[] {
    const listesDeDiffusionNonSelectionnes = listesDeDiffusion.filter(
      (uneListe) =>
        listesSelectionnes.findIndex((l) => l.id === uneListe.id) < 0
    )

    return listesDeDiffusionNonSelectionnes.map((uneListeDeDiffusion) => ({
      id: uneListeDeDiffusion.id,
      value: getListeInformations(uneListeDeDiffusion),
    }))
  }

  function rechercheUnBeneficiaire(inputValue: string) {
    return getBeneficiairesNonSelectionnes().find(
      ({ value }) =>
        value.localeCompare(inputValue, undefined, {
          sensitivity: 'base',
        }) === 0
    )
  }

  function rechercheUneListeDeDiffusion(value: string) {
    return listesDeDiffusion.find(
      (uneListe: ListeDeDiffusion) => value === getListeInformations(uneListe)
    )
  }

  function buildOptions(): OptionBeneficiaire[] {
    let beneficiairesNonSelectionnes = getBeneficiairesNonSelectionnes()
    if (!beneficiairesNonSelectionnes.length) return []
    if (listesDeDiffusion?.length) {
      const listeFormate: OptionBeneficiaire[] =
        getListesDeDiffusionNonSelectionnes()
      beneficiairesNonSelectionnes = listeFormate.concat(
        beneficiairesNonSelectionnes
      )
    }
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

  function updateBeneficiairesSelectionnes(
    option: OptionBeneficiaire | OptionBeneficiaire[]
  ) {
    const updatedBeneficiairesSelectionnes =
      beneficiairesSelectionnes.concat(option)
    setBeneficiairesSelectionnes(updatedBeneficiairesSelectionnes)
    onUpdate({
      beneficiaires: updatedBeneficiairesSelectionnes.map(
        (selected) => selected.id
      ),
    })
  }

  function selectBeneficiaire(inputValue: string) {
    if (disabled) return

    if (inputValue === SELECT_ALL_BENEFICIAIRES_OPTION) {
      updateBeneficiairesSelectionnes(selectAllBeneficiaires())
      input.current!.value = ''
      return
    }

    if (rechercheUneListeDeDiffusion(inputValue)) {
      const uneListeDeDiffusion = rechercheUneListeDeDiffusion(inputValue)!
      setListesSelectionnes([...listesSelectionnes, uneListeDeDiffusion])
      onUpdate({
        listesDeDiffusion: listesSelectionnes.map((selected) => selected.id),
      })
      input.current!.value = ''
      return
    }

    const option = rechercheUnBeneficiaire(inputValue)
    if (option) {
      updateBeneficiairesSelectionnes(option)
      input.current!.value = ''
      return
    }
  }

  function deselectionnerBeneficiaire(id: string) {
    if (disabled) return

    const indexListe = listesSelectionnes.findIndex(
      (uneListeSelectionne) => uneListeSelectionne.id === id
    )

    if (indexListe > -1) {
      const updatedListesSelectionnes = [...listesSelectionnes]
      updatedListesSelectionnes.splice(indexListe, 1)
      setListesSelectionnes(updatedListesSelectionnes)
      onUpdate({
        listesDeDiffusion: listesSelectionnes.map((selected) => selected.id),
      })
    }

    const indexBeneficiaire = beneficiairesSelectionnes.findIndex(
      (j) => j.id === id
    )
    if (indexBeneficiaire > -1) {
      const updatedBeneficiairesSelectionnes = [...beneficiairesSelectionnes]
      updatedBeneficiairesSelectionnes.splice(indexBeneficiaire, 1)
      setBeneficiairesSelectionnes(updatedBeneficiairesSelectionnes)
      onUpdate({
        beneficiaires: updatedBeneficiairesSelectionnes.map(
          (selected) => selected.id
        ),
      })
    }
  }

  function beneficiairesEtListesSelectionne() {
    const beneficiairesFormate: OptionBeneficiaire[] =
      beneficiairesSelectionnes.map(
        ({ id, value, avecIndication = false }) => ({
          id,
          value,
          avecIndication: avecIndication,
          estUneListe: false,
        })
      )
    const listesFormate: OptionBeneficiaire[] = listesSelectionnes.map(
      (uneListeDeDiffusion) => ({
        id: uneListeDeDiffusion.id,
        value: getListeInformations(uneListeDeDiffusion),
        estUneListe: true,
      })
    )

    return listesFormate.concat(beneficiairesFormate)
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

      {(beneficiairesSelectionnes.length > 0 ||
        listesSelectionnes.length > 0) && (
        <Multiselection
          selection={beneficiairesEtListesSelectionne()}
          typeSelection='beneficiaire'
          unselect={deselectionnerBeneficiaire}
          renderIndication={renderIndication}
          disabled={disabled}
        />
      )}
    </>
  )
}

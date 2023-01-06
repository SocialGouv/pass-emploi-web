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
  const [listesSelectionnees, setListesSelectionnees] = useState<
    ListeDeDiffusion[]
  >([])
  const input = useRef<HTMLInputElement>(null)

  function getBeneficiairesNonSelectionnees(): OptionBeneficiaire[] {
    return beneficiaires.filter(
      (benef) =>
        beneficiairesSelectionnes.findIndex((j) => j.id === benef.id) < 0
    )
  }

  function getListesDeDiffusionNonSelectionnees(): OptionBeneficiaire[] {
    const listesDeDiffusionNonSelectionnees = listesDeDiffusion.filter(
      (uneListe) =>
        listesSelectionnees.findIndex((l) => l.id === uneListe.id) < 0
    )

    return listesDeDiffusionNonSelectionnees.map((uneListeDeDiffusion) => ({
      id: uneListeDeDiffusion.id,
      value: getListeInformations(uneListeDeDiffusion),
    }))
  }

  function rechercheUnBeneficiaire(inputValue: string) {
    return getBeneficiairesNonSelectionnees().find(
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
    let beneficiairesNonSelectionnes = getBeneficiairesNonSelectionnees()
    if (!beneficiairesNonSelectionnes.length) return []
    if (listesDeDiffusion?.length) {
      const listeFormatee: OptionBeneficiaire[] =
        getListesDeDiffusionNonSelectionnees()
      beneficiairesNonSelectionnes = listeFormatee.concat(
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

  function selectionnerOption(inputValue: string) {
    if (disabled) return

    if (inputValue === SELECT_ALL_BENEFICIAIRES_OPTION) {
      updateBeneficiairesSelectionnes(selectAllBeneficiaires())
      input.current!.value = ''
      return
    }

    const listeDeDiffusion = rechercheUneListeDeDiffusion(inputValue)
    if (listeDeDiffusion) {
      const updatedListesSelectionnees =
        listesSelectionnees.concat(listeDeDiffusion)
      setListesSelectionnees(updatedListesSelectionnees)
      onUpdate({
        listesDeDiffusion: updatedListesSelectionnees.map(({ id }) => id),
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

  function selectAllBeneficiaires(): OptionBeneficiaire[] {
    return getBeneficiairesNonSelectionnees()
  }

  function updateBeneficiairesSelectionnes(
    option: OptionBeneficiaire | OptionBeneficiaire[]
  ) {
    const updatedBeneficiairesSelectionnes =
      beneficiairesSelectionnes.concat(option)
    setBeneficiairesSelectionnes(updatedBeneficiairesSelectionnes)
    onUpdate({
      beneficiaires: updatedBeneficiairesSelectionnes.map(({ id }) => id),
    })
  }

  function deselectionnerOption(id: string) {
    if (disabled) return

    const indexListe = listesSelectionnees.findIndex(
      (uneListeSelectionnee) => uneListeSelectionnee.id === id
    )

    if (indexListe > -1) {
      const updatedListesSelectionnees = [...listesSelectionnees]
      updatedListesSelectionnees.splice(indexListe, 1)
      setListesSelectionnees(updatedListesSelectionnees)
      onUpdate({
        listesDeDiffusion: updatedListesSelectionnees.map(({ id }) => id),
      })
      return
    }

    const indexBeneficiaire = beneficiairesSelectionnes.findIndex(
      (j) => j.id === id
    )
    if (indexBeneficiaire > -1) {
      const updatedBeneficiairesSelectionnes = [...beneficiairesSelectionnes]
      updatedBeneficiairesSelectionnes.splice(indexBeneficiaire, 1)
      setBeneficiairesSelectionnes(updatedBeneficiairesSelectionnes)
      onUpdate({
        beneficiaires: updatedBeneficiairesSelectionnes.map(({ id }) => id),
      })
    }
  }

  function beneficiairesEtListesSelectionnes() {
    const beneficiairesFormates = beneficiairesSelectionnes.map(
      ({ id, value, avecIndication = false }) => ({
        id,
        value,
        avecIndication,
        estUneListe: false,
      })
    )
    const listesFormatees = listesSelectionnees.map((liste) => ({
      id: liste.id,
      value: getListeInformations(liste),
      avecIndication: false,
      estUneListe: true,
    }))

    return listesFormatees.concat(beneficiairesFormates)
  }

  function countBeneficiairesUniques() {
    const idsBeneficiaires = beneficiairesSelectionnes
      .map(({ id }) => id)
      .concat(
        listesSelectionnees.flatMap(({ beneficiaires }) =>
          beneficiaires.map((beneficiaire) => beneficiaire.id)
        )
      )

    return new Set(idsBeneficiaires).size
  }

  function getHelpText() {
    return listesDeDiffusion?.length > 0
      ? 'Nom et prénom du bénéficiaire ou nom de votre liste de diffusion'
      : 'Nom et prénom'
  }

  return (
    <>
      <Label htmlFor='select-beneficiaires' inputRequired={required}>
        {{
          main: 'Rechercher et ajouter des destinataires',
          helpText: getHelpText(),
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
        onChange={(value: string) => selectionnerOption(value)}
        required={required}
        multiple={true}
        aria-controls='selected-beneficiaires'
        ref={input}
        invalid={Boolean(error)}
        disabled={disabled}
      />

      <p
        aria-label={`${typeSelection} sélectionnés (${countBeneficiairesUniques()})`}
        id='selected-beneficiaires--title'
        className='text-base-medium mb-2'
        aria-live='polite'
      >
        {typeSelection} ({countBeneficiairesUniques()})
      </p>

      {countBeneficiairesUniques() > 0 && (
        <Multiselection
          selection={beneficiairesEtListesSelectionnes()}
          typeSelection='beneficiaire'
          unselect={deselectionnerOption}
          renderIndication={renderIndication}
          disabled={disabled}
        />
      )}
    </>
  )
}

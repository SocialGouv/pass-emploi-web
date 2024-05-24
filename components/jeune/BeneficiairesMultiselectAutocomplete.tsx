import React, { useRef, useState } from 'react'

import { estClos, Evenement } from '../../interfaces/evenement'
import { getNomJeuneComplet } from '../../interfaces/jeune'
import { ButtonStyle } from '../ui/Button/Button'
import ButtonLink from '../ui/Button/ButtonLink'
import { ValueWithError } from '../ValueWithError'

import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import Multiselection from 'components/ui/Form/Multiselection'
import SelectAutocomplete from 'components/ui/Form/SelectAutocomplete'
import {
  getListeInformations,
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
  lienEmargement?: string
  trackEmargement: () => void
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
  trackEmargement,
  lienEmargement,
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
    if (
      !beneficiairesNonSelectionnes.length &&
      !getListesDeDiffusionNonSelectionnees().length
    )
      return []
    if (listesDeDiffusion?.length) {
      const listeFormatee: OptionBeneficiaire[] =
        getListesDeDiffusionNonSelectionnees()
      beneficiairesNonSelectionnes = listeFormatee.concat(
        beneficiairesNonSelectionnes
      )
    }
    return [
      {
        id: 'select-all-destinataires',
        value: SELECT_ALL_DESTINATAIRES_OPTION,
      },
    ].concat(beneficiairesNonSelectionnes)
  }

  function selectionneBeneficiairesDuConseiller() {
    return beneficiaires.filter((beneficiaire) => !beneficiaire.avecIndication)
  }

  function selectionnerOption(inputValue: string) {
    if (disabled) return

    if (inputValue === SELECT_ALL_DESTINATAIRES_OPTION) {
      setBeneficiairesSelectionnes(selectionneBeneficiairesDuConseiller())
      onUpdate({
        beneficiaires: beneficiaires.map((beneficiaire) => beneficiaire.id),
      })
      input.current!.value = ''
      return
    }

    const listeDeDiffusion = rechercheUneListeDeDiffusion(inputValue)
    if (listeDeDiffusion) {
      const updatedListesSelectionnees = [
        listeDeDiffusion,
        ...listesSelectionnees,
      ]
      setListesSelectionnees(updatedListesSelectionnees)
      onUpdate({
        listesDeDiffusion: updatedListesSelectionnees.map((liste) => liste.id),
      })
      input.current!.value = ''
      return
    }

    const option = rechercheUnBeneficiaire(inputValue)
    if (option) {
      const updatedBeneficiairesSelectionnes = [
        option,
        ...beneficiairesSelectionnes,
      ]
      setBeneficiairesSelectionnes(updatedBeneficiairesSelectionnes)
      onUpdate({
        beneficiaires: updatedBeneficiairesSelectionnes.map(
          (beneficiaire) => beneficiaire.id
        ),
      })
      input.current!.value = ''
    }
  }

  function deselectionnerOption(idOption: string) {
    if (disabled) return

    const indexListe = listesSelectionnees.findIndex(
      (uneListeSelectionnee) => uneListeSelectionnee.id === idOption
    )

    if (indexListe > -1) {
      const updatedListesSelectionnees = [...listesSelectionnees]
      updatedListesSelectionnees.splice(indexListe, 1)
      setListesSelectionnees(updatedListesSelectionnees)
      onUpdate({
        listesDeDiffusion: updatedListesSelectionnees.map((liste) => liste.id),
      })
      return
    }

    const indexBeneficiaire = beneficiairesSelectionnes.findIndex(
      (j) => j.id === idOption
    )
    if (indexBeneficiaire > -1) {
      const updatedBeneficiairesSelectionnes = [...beneficiairesSelectionnes]
      updatedBeneficiairesSelectionnes.splice(indexBeneficiaire, 1)
      setBeneficiairesSelectionnes(updatedBeneficiairesSelectionnes)
      onUpdate({
        beneficiaires: updatedBeneficiairesSelectionnes.map(
          (beneficiaire) => beneficiaire.id
        ),
      })
    }
  }

  function beneficiairesEtListesSelectionnes() {
    const beneficiairesFormates = beneficiairesSelectionnes.map(
      ({ id: idBeneficiaire, value, avecIndication = false }) => ({
        id: idBeneficiaire,
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
      .map((beneficiaire) => beneficiaire.id)
      .concat(
        listesSelectionnees.flatMap((liste) =>
          liste.beneficiaires.map((beneficiaire) => beneficiaire.id)
        )
      )

    return new Set(idsBeneficiaires).size
  }

  function labelHelpText() {
    return listesDeDiffusion?.length > 0
      ? 'Recherchez et ajoutez un ou plusieurs bénéficiaires et/ou listes de diffusion'
      : 'Recherchez et ajoutez un ou plusieurs bénéficiaires'
  }

  return (
    <>
      <Label htmlFor={id} inputRequired={required}>
        {{
          main: typeSelection,
          helpText: labelHelpText(),
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
        className='text-base-medium mb-2 flex mb-4 justify-between items-center'
        aria-live='polite'
      >
        {typeSelection} ({countBeneficiairesUniques()})
        {lienEmargement && (
          <ButtonLink
            style={ButtonStyle.PRIMARY}
            href={lienEmargement}
            externalLink={true}
            label='Exporter la liste des inscrits'
            onClick={trackEmargement}
          ></ButtonLink>
        )}
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

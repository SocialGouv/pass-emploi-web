import React, { ReactElement, useEffect, useRef, useState } from 'react'

import { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import InputError from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import Multiselection from 'components/ui/Form/Multiselection'
import SelectAutocomplete from 'components/ui/Form/SelectAutocomplete'
import { IconName } from 'components/ui/IconComponent'
import ExternalLink from 'components/ui/Navigation/ExternalLink'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import {
  getListeInformations,
  ListeDeDiffusion,
} from 'interfaces/liste-de-diffusion'
import { getUrlFormulaireSupport } from 'interfaces/structure'
import { trackEvent } from 'utils/analytics/matomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

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
  Indication?: (props: { value: string; id: string }) => ReactElement
  ariaDescribedBy?: string
  lienExport?: string
  trackExport?: () => void
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
  Indication,
  ariaDescribedBy,
  trackExport,
  lienExport,
}: BeneficiairesMultiselectAutocompleteProps) {
  const [conseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()
  const [navigateurEstEdge, setNavigateurEstEdge] = useState<boolean>(false)
  const [beneficiairesSelectionnes, setBeneficiairesSelectionnes] =
    useState<OptionBeneficiaire[]>(defaultBeneficiaires)
  const [listesSelectionnees, setListesSelectionnees] = useState<
    ListeDeDiffusion[]
  >([])
  const inputRef = useRef<HTMLInputElement>(null)

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
      inputRef.current!.value = ''
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
      inputRef.current!.value = ''
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
      inputRef.current!.value = ''
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

  function trackContacterSupportClick() {
    trackEvent({
      structure: conseiller.structure,
      categorie: 'Contact Support',
      action: 'Profil',
      nom: '',
      aDesBeneficiaires: portefeuille.length > 0,
    })
  }

  useEffect(() => {
    setNavigateurEstEdge(/Edg/.test(navigator.userAgent))
  }, [])

  return (
    <>
      <Label htmlFor={id} inputRequired={required}>
        {{
          main: typeSelection,
          helpText: labelHelpText(),
        }}
      </Label>

      {navigateurEstEdge && (
        <FailureAlert label='Cette fonctionnalité peut être dégradée sur votre navigateur (Edge).'>
          <p>
            Nous recommandons l’usage de Firefox ou de Chrome. Si vous ne pouvez
            pas changer de navigateur, veuillez&nbsp;
            <span className={'text-warning hover:text-primary'}>
              <ExternalLink
                href={getUrlFormulaireSupport(conseiller.structure)}
                label='contacter le support'
                onClick={trackContacterSupportClick}
              />
            </span>
          </p>
        </FailureAlert>
      )}

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
        ref={inputRef}
        invalid={Boolean(error)}
        disabled={disabled}
        ariaDescribedBy={ariaDescribedBy}
      />

      <p
        aria-label={`${typeSelection} sélectionnés (${countBeneficiairesUniques()})`}
        id='selected-beneficiaires--title'
        className='text-base-medium flex mb-4 justify-between items-center'
      >
        {typeSelection} ({countBeneficiairesUniques()})
        {lienExport && trackExport && (
          <ButtonLink
            style={ButtonStyle.PRIMARY}
            href={lienExport}
            externalIcon={IconName.OpenInNew}
            label='Exporter la liste des inscrits'
            onClick={trackExport}
          ></ButtonLink>
        )}
      </p>

      {countBeneficiairesUniques() > 0 && (
        <Multiselection
          selection={beneficiairesEtListesSelectionnes()}
          typeSelection='beneficiaire'
          unselect={deselectionnerOption}
          onYieldFocus={() => inputRef.current!.focus()}
          Indication={Indication}
          disabled={disabled}
        />
      )}
    </>
  )
}

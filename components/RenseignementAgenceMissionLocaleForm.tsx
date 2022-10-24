import React, { FormEvent, useEffect, useState } from 'react'
import { Agence } from 'interfaces/referentiel'
import Label from 'components/ui/Form/Label'
import Input from 'components/ui/Form/Input'
import Select from 'components/ui/Form/Select'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import Button, { ButtonStyle } from 'components/ui/Button/Button'

interface RenseignementAgenceMissionLocaleFormProps {
  referentielAgences: Agence[]
  onAgenceChoisie: (agence: { id?: string; nom: string }) => void
  onClose?: () => void
  container: FormContainer
}

export enum FormContainer {
  MODAL,
  PAGE,
}

interface OptionAgence {
  id: string
  value: string
}

const AGENCE_PAS_DANS_LA_LISTE_OPTION = {
  id: 'agence-pas-dans-la-liste',
  value: 'Ma mission locale n’apparaît pas dans la liste',
}

const CONTACTER_LE_SUPPORT_LABEL = `Vous avez indiqué que votre agence Mission Locale est absente de la liste. 
  Pour faire une demande d’ajout de votre mission locale, vous devez contacter le support.`

export function RenseignementAgenceMissionLocaleForm({
  referentielAgences,
  onAgenceChoisie,
  onClose,
  container,
}: RenseignementAgenceMissionLocaleFormProps) {
  const [departement, setDepartement] = useState<string>('')
  const [agencesMiloFiltrees, setAgencesMiloFiltrees] =
    useState<Agence[]>(referentielAgences)
  const [optionSelectionnee, setOptionSelectionnee] = useState<
    OptionAgence | undefined
  >()

  function buildOptions(): OptionAgence[] {
    return [AGENCE_PAS_DANS_LA_LISTE_OPTION].concat(
      agencesMiloFiltrees.map(agenceToOption)
    )
  }

  function selectDepartement(departement: string) {
    setOptionSelectionnee(undefined)
    setDepartement(departement)
  }

  function selectOption(optionValue: string) {
    const option =
      optionValue === AGENCE_PAS_DANS_LA_LISTE_OPTION.value
        ? AGENCE_PAS_DANS_LA_LISTE_OPTION
        : buildOptions().find((a) => a.value === optionValue)
    setOptionSelectionnee(option)
  }

  function agenceEstDansLaListe() {
    return (
      optionSelectionnee &&
      optionSelectionnee.value !== AGENCE_PAS_DANS_LA_LISTE_OPTION.value
    )
  }

  function agenceNestPasDansLaListe() {
    return (
      optionSelectionnee &&
      optionSelectionnee.value === AGENCE_PAS_DANS_LA_LISTE_OPTION.value
    )
  }

  function submitAgenceSelectionnee(e: FormEvent) {
    e.preventDefault()
    if (agenceEstDansLaListe()) {
      console.log('AGENCE SELECTIONNEE ' + optionSelectionnee!.value)
      const agence = referentielAgences.find((a) => a.id === optionSelectionnee!.id)
      onAgenceChoisie(agence!)
    } else if (agenceEstDansLaListe()) {
      console.log('AGENCE n’apparait pas ' + optionSelectionnee!.value)
    }
  }

  useEffect(() => {
    const agencesFiltrees =
      departement !== ''
        ? referentielAgences.filter(
            (agence) => agence.codeDepartement === departement
          )
        : referentielAgences
    setAgencesMiloFiltrees(agencesFiltrees)
  }, [departement])

  return (
    <form
      onSubmit={submitAgenceSelectionnee}
      className={`${
        container === FormContainer.MODAL
          ? 'px-10 pt-6 '
          : 'flex flex-wrap mt-4'
      }`}
    >
      <Label htmlFor='departement'>Departement de ma Mission Locale</Label>
      <Input type='text' id='departement' onChange={selectDepartement} />

      <Label htmlFor='intitule-action-predefinie' inputRequired={true}>
        Recherchez votre Mission Locale dans la liste suivante
      </Label>
      <Select
        //TODO-1127 : reset select on departement changed
        id='intitule-action-predefinie'
        required={true}
        onChange={selectOption}
      >
        {buildOptions().map(({ id, value }) => (
          <option key={id}>{value}</option>
        ))}
      </Select>

      {agenceNestPasDansLaListe() && container === FormContainer.MODAL && (
        <div className='mt-2'>
          <InformationMessage content={CONTACTER_LE_SUPPORT_LABEL} />
        </div>
      )}

      {agenceNestPasDansLaListe() && container === FormContainer.PAGE && (
        <div className='mb-4'>{CONTACTER_LE_SUPPORT_LABEL}</div>
      )}
      <div
        className={`flex justify-center ${
          container === FormContainer.MODAL ? 'mt-14' : ''
        }`}
      >
        {container === FormContainer.MODAL && (
          <Button
            type='button'
            style={ButtonStyle.SECONDARY}
            className='mr-6'
            onClick={onClose}
          >
            Annuler
          </Button>
        )}
        {(!optionSelectionnee || agenceEstDansLaListe()) && (
          <Button type='submit' className='mr-6'>
            Ajouter
          </Button>
        )}
        {agenceNestPasDansLaListe() && (
          <Button type='button' style={ButtonStyle.PRIMARY}>
            Contacter le support
          </Button>
        )}
      </div>
    </form>
  )
}

export function agenceToOption(agence: Agence): OptionAgence {
  return {
    id: agence.id,
    value: agence.nom,
  }
}

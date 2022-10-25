import React, { FormEvent, useEffect, useState } from 'react'

import { RequiredValue } from 'components/RequiredValue'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import Input from 'components/ui/Form/Input'
import Label from 'components/ui/Form/Label'
import Select from 'components/ui/Form/Select'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { Agence } from 'interfaces/referentiel'

interface RenseignementAgenceMissionLocaleFormProps {
  referentielAgences: Agence[]
  onAgenceChoisie: (agence: { id?: string; nom: string }) => void
  onContacterSupportClick: () => void
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

const CONTACTER_LE_SUPPORT_LABEL = `Vous avez indiqué que votre agence Mission locale est absente de la liste. 
  Pour faire une demande d’ajout de votre mission locale, vous devez contacter le support.`

export function RenseignementAgenceMissionLocaleForm({
  referentielAgences,
  onAgenceChoisie,
  onContacterSupportClick,
  onClose,
  container,
}: RenseignementAgenceMissionLocaleFormProps) {
  const [departement, setDepartement] = useState<string>('')
  const [agencesMiloFiltrees, setAgencesMiloFiltrees] =
    useState<Agence[]>(referentielAgences)
  const [idAgenceSelectionnee, setIdAgenceSelectionnee] =
    useState<RequiredValue>({ value: '' })

  function buildOptions(): OptionAgence[] {
    return [AGENCE_PAS_DANS_LA_LISTE_OPTION].concat(
      agencesMiloFiltrees.map(agenceToOption)
    )
  }

  function selectDepartement(departement: string) {
    setIdAgenceSelectionnee({ value: '' })
    setDepartement(departement)
  }

  function selectOption(optionValue: string) {
    if (optionValue === AGENCE_PAS_DANS_LA_LISTE_OPTION.value) {
      setIdAgenceSelectionnee({ value: AGENCE_PAS_DANS_LA_LISTE_OPTION.id })
    } else {
      const agence = referentielAgences.find((a) => a.nom === optionValue)
      setIdAgenceSelectionnee({ value: agence ? agence.id : '' })
    }
  }

  function agenceEstDansLaListe() {
    return (
      idAgenceSelectionnee.value !== '' &&
      idAgenceSelectionnee.value !== AGENCE_PAS_DANS_LA_LISTE_OPTION.id
    )
  }

  function agenceNestPasDansLaListe() {
    return idAgenceSelectionnee.value === AGENCE_PAS_DANS_LA_LISTE_OPTION.id
  }

  function submitMissionLocaleSelectionnee(e: FormEvent) {
    e.preventDefault()
    if (agenceEstDansLaListe()) {
      const agence = referentielAgences.find(
        (a) => a.id === idAgenceSelectionnee.value
      )
      onAgenceChoisie(agence!)
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
  }, [departement, referentielAgences])

  return (
    <form
      onSubmit={submitMissionLocaleSelectionnee}
      className={`${container === FormContainer.MODAL ? 'px-10 pt-6' : ''}`}
    >
      <div
        className={`${
          container === FormContainer.PAGE
            ? 'flex flex-wrap items-baseline mt-4 gap-4'
            : ''
        }`}
      >
        <div className={`${container === FormContainer.PAGE ? 'w-[30%]' : ''}`}>
          <Label htmlFor='departement'>Département de ma Mission locale</Label>
          <Input type='text' id='departement' onChange={selectDepartement} />
        </div>

        <div className={`${container === FormContainer.PAGE ? 'w-[65%]' : ''}`}>
          <Label htmlFor='intitule-action-predefinie' inputRequired={true}>
            Recherchez votre Mission locale dans la liste suivante
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
        </div>
      </div>

      {agenceNestPasDansLaListe() && container === FormContainer.MODAL && (
        <div className='mt-2'>
          <InformationMessage content={CONTACTER_LE_SUPPORT_LABEL} />
        </div>
      )}

      {agenceNestPasDansLaListe() && container === FormContainer.PAGE && (
        <div className='mb-4'>
          <p>{CONTACTER_LE_SUPPORT_LABEL}</p>
        </div>
      )}
      <div
        className={`${
          container === FormContainer.MODAL ? 'flex justify-center mt-14' : ''
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
        {(idAgenceSelectionnee.value === '' || agenceEstDansLaListe()) && (
          <Button type='submit' className='mr-6'>
            Ajouter
          </Button>
        )}
        {agenceNestPasDansLaListe() && (
          <form action='mailto:support@pass-emploi.beta.gouv.fr'>
            <Button
              type='submit'
              style={ButtonStyle.PRIMARY}
              onClick={onContacterSupportClick}
            >
              Contacter le support
            </Button>
          </form>
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

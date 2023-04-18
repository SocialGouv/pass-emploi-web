import React, { FormEvent, useEffect, useState } from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import Input from 'components/ui/Form/Input'
import Label from 'components/ui/Form/Label'
import Select from 'components/ui/Form/Select'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { Agence } from 'interfaces/referentiel'

interface RenseignementAgenceMissionLocaleFormProps {
  referentielAgences: Agence[]
  onAgenceChoisie: (agence: { id: string; nom: string }) => void
  onContacterSupport: () => void
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

const AGENCE_PAS_DANS_LA_LISTE_OPTION: OptionAgence = {
  id: 'agence-pas-dans-la-liste',
  value: 'Ma Mission Locale n’apparaît pas dans la liste',
}

const CONTACTER_LE_SUPPORT_LABEL = `Vous avez indiqué que votre agence Mission Locale est absente de la liste. 
  Pour faire une demande d’ajout de votre Mission Locale, vous devez contacter le support.`

export function RenseignementAgenceMissionLocaleForm({
  referentielAgences,
  onAgenceChoisie,
  onContacterSupport,
  onClose = () => {},
  container,
}: RenseignementAgenceMissionLocaleFormProps) {
  const [departement, setDepartement] = useState<string>('')
  const [agencesMiloFiltrees, setAgencesMiloFiltrees] =
    useState<Agence[]>(referentielAgences)
  const [idAgenceSelectionnee, setIdAgenceSelectionnee] = useState<string>()

  function buildOptions(): OptionAgence[] {
    return [AGENCE_PAS_DANS_LA_LISTE_OPTION].concat(
      agencesMiloFiltrees.map(({ id, nom }) => ({ id, value: nom }))
    )
  }

  function selectDepartement(departementSelectionne: string) {
    setIdAgenceSelectionnee(undefined)
    setDepartement(departementSelectionne)
  }

  function agenceEstDansLaListe() {
    return (
      idAgenceSelectionnee &&
      idAgenceSelectionnee !== AGENCE_PAS_DANS_LA_LISTE_OPTION.id
    )
  }

  function agenceNestPasDansLaListe() {
    return idAgenceSelectionnee === AGENCE_PAS_DANS_LA_LISTE_OPTION.id
  }

  function submitMissionLocaleSelectionnee(e: FormEvent) {
    e.preventDefault()
    if (agenceEstDansLaListe()) {
      const agence = referentielAgences.find(
        (uneAgence) => uneAgence.id === idAgenceSelectionnee
      )
      onAgenceChoisie(agence!)
    }
  }

  useEffect(() => {
    const agencesFiltrees =
      departement !== ''
        ? referentielAgences.filter((agence) =>
            agence.codeDepartement
              .padStart(2, '0')
              .startsWith(departement.padStart(2, '0'))
          )
        : referentielAgences
    setAgencesMiloFiltrees(agencesFiltrees)
  }, [departement, referentielAgences])

  return (
    <form
      onSubmit={submitMissionLocaleSelectionnee}
      className={`${container === FormContainer.PAGE ? '' : 'px-10 pt-6'}`}
    >
      <div
        className={`${
          container === FormContainer.PAGE ? 'flex items-end mt-4 gap-4' : ''
        }`}
      >
        <div className={`${container === FormContainer.PAGE ? 'w-[40%]' : ''}`}>
          <Label htmlFor='departement'>
            {{
              main: 'Département de ma Mission Locale',
              helpText: '(ex : 1, 20, 973)',
            }}
          </Label>
          <Input type='text' id='departement' onChange={selectDepartement} />
        </div>

        <div className={`${container === FormContainer.PAGE ? 'w-[55%]' : ''}`}>
          <Label htmlFor='mission-locale' inputRequired={true}>
            Recherchez votre Mission Locale dans la liste suivante
          </Label>
          <Select
            id='mission-locale'
            key={departement}
            required={true}
            onChange={setIdAgenceSelectionnee}
          >
            {buildOptions().map(({ id, value }) => (
              <option key={id} value={id}>
                {value}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {agenceNestPasDansLaListe() && container !== FormContainer.PAGE && (
        <div className='mt-2'>
          <InformationMessage label={CONTACTER_LE_SUPPORT_LABEL} />
        </div>
      )}

      {agenceNestPasDansLaListe() && container === FormContainer.PAGE && (
        <div className='mb-4'>
          <p>{CONTACTER_LE_SUPPORT_LABEL}</p>
        </div>
      )}
      <div
        className={`${
          container === FormContainer.PAGE ? '' : 'flex justify-center mt-14'
        }`}
      >
        {container !== FormContainer.PAGE && (
          <Button
            type='button'
            style={ButtonStyle.SECONDARY}
            className='mr-6'
            onClick={onClose}
          >
            Annuler
          </Button>
        )}
        {(!idAgenceSelectionnee || agenceEstDansLaListe()) && (
          <Button type='submit' className='mr-6'>
            Ajouter
          </Button>
        )}
        {agenceNestPasDansLaListe() && (
          <ButtonLink
            className={'w-fit'}
            href={'mailto:' + process.env.SUPPORT_MAIL}
            style={ButtonStyle.TERTIARY}
            onClick={onContacterSupport}
          >
            <IconComponent
              name={IconName.Mail}
              aria-hidden={true}
              focusable={false}
              className='inline w-4 h-4 mr-2'
            />
            Contacter le support
          </ButtonLink>
        )}
      </div>
    </form>
  )
}

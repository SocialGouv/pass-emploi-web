import React, { FormEvent, MouseEvent, useEffect, useState } from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import Input from 'components/ui/Form/Input'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import Select from 'components/ui/Form/Select'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { ValueWithError } from 'components/ValueWithError'
import { Agence } from 'interfaces/referentiel'
import styles from 'styles/components/Button.module.css'

interface RenseignementAgenceMissionLocaleFormProps {
  referentielAgences: Agence[]
  onAgenceChoisie: (agence: { id: string; nom: string }) => void
  onContacterSupport: () => void
  isInModal?: boolean
  onClose?: (e: MouseEvent) => void
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
  isInModal = false,
}: RenseignementAgenceMissionLocaleFormProps) {
  const [departement, setDepartement] = useState<string>('')
  const [agencesMiloFiltrees, setAgencesMiloFiltrees] =
    useState<Agence[]>(referentielAgences)
  const [idAgenceSelectionnee, setIdAgenceSelectionnee] =
    useState<ValueWithError<string | undefined>>()

  function buildOptions(): OptionAgence[] {
    return [AGENCE_PAS_DANS_LA_LISTE_OPTION].concat(
      agencesMiloFiltrees.map(({ id, nom }) => ({ id, value: nom }))
    )
  }

  function selectDepartement(departementSelectionne: string) {
    setIdAgenceSelectionnee({ value: undefined })
    setDepartement(departementSelectionne)
  }

  function agenceEstDansLaListe() {
    return (
      idAgenceSelectionnee?.value &&
      idAgenceSelectionnee.value !== AGENCE_PAS_DANS_LA_LISTE_OPTION.id
    )
  }

  function agenceNestPasDansLaListe() {
    return idAgenceSelectionnee?.value === AGENCE_PAS_DANS_LA_LISTE_OPTION.id
  }

  function submitMissionLocaleSelectionnee(e: FormEvent) {
    e.preventDefault()
    if (!idAgenceSelectionnee?.value)
      setIdAgenceSelectionnee({
        value: idAgenceSelectionnee?.value,
        error:
          'Le champ ”Recherchez votre Mission Locale” est vide. Renseignez votre Mission Locale.',
      })
    if (agenceEstDansLaListe()) {
      const agence = referentielAgences.find(
        (uneAgence) => uneAgence.id === idAgenceSelectionnee?.value
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
      noValidate={true}
      className={isInModal ? 'px-10 pt-6' : ''}
    >
      <div className={isInModal ? '' : 'flex items-end mt-4 gap-4'}>
        <div className={isInModal ? '' : 'w-[40%]'}>
          <Label htmlFor='departement'>
            {{
              main: 'Département de ma Mission Locale',
              helpText: '(ex : 1, 20, 973)',
            }}
          </Label>
          <Input type='text' id='departement' onChange={selectDepartement} />
        </div>

        <div className={isInModal ? '' : 'w-[55%]'}>
          <Label htmlFor='mission-locale' inputRequired={true}>
            Recherchez votre Mission Locale dans la liste suivante
          </Label>
          {idAgenceSelectionnee?.error && (
            <InputError id='mission-locale--error' className='mt-2'>
              {idAgenceSelectionnee.error}
            </InputError>
          )}
          <Select
            id='mission-locale'
            key={departement}
            required={true}
            onChange={(nouvelleAgence) =>
              setIdAgenceSelectionnee({ value: nouvelleAgence })
            }
          >
            {buildOptions().map(({ id, value }) => (
              <option key={id} value={id}>
                {value}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {agenceNestPasDansLaListe() && isInModal && (
        <div className='mt-2'>
          <InformationMessage label={CONTACTER_LE_SUPPORT_LABEL} />
        </div>
      )}

      {agenceNestPasDansLaListe() && !isInModal && (
        <div className='mb-4'>
          <p>{CONTACTER_LE_SUPPORT_LABEL}</p>
        </div>
      )}
      <div className={isInModal ? 'flex justify-center mt-14' : ''}>
        {isInModal && (
          <Button
            type='button'
            style={ButtonStyle.SECONDARY}
            className='mr-6'
            onClick={onClose}
          >
            Annuler
          </Button>
        )}

        {(!idAgenceSelectionnee?.value || agenceEstDansLaListe()) && (
          <Button type='submit' className='mr-6'>
            Ajouter
          </Button>
        )}

        {agenceNestPasDansLaListe() && (
          <a
            className={`w-fit flex items-center justify-center text-s-bold ${styles.button} ${styles.buttonTertiary}`}
            href={'mailto:' + process.env.NEXT_PUBLIC_SUPPORT_MAIL}
            target='_blank'
            rel='noreferrer noopener'
            onClick={onContacterSupport}
          >
            <IconComponent
              name={IconName.Mail}
              aria-hidden={true}
              focusable={false}
              className='inline w-4 h-4 mr-2'
            />
            Contacter le support{' '}
            <span className='sr-only'>(nouvelle fenêtre)</span>
          </a>
        )}
      </div>
    </form>
  )
}

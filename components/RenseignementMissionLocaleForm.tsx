import React, { FormEvent, MouseEvent, useEffect, useState } from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import Input from 'components/ui/Form/Input'
import InputError from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import Select from 'components/ui/Form/Select'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import { ValueWithError } from 'components/ValueWithError'
import { Agence, MissionLocale } from 'interfaces/referentiel'
import { getUrlFormulaireSupport } from 'interfaces/structure'
import styles from 'styles/components/Button.module.css'

interface RenseignementMissionLocaleFormProps {
  referentielMissionsLocales: Agence[]
  onMissionLocaleChoisie: (missionLocale: MissionLocale) => void
  onContacterSupport: () => void
  isInModal?: boolean
  onClose?: (e: MouseEvent) => void
}

interface Option {
  id: string
  value: string
}

const MILO_PAS_DANS_LA_LISTE_OPTION: Option = {
  id: 'milo-pas-dans-la-liste',
  value: 'Ma Mission Locale n’apparaît pas dans la liste',
}

const CONTACTER_LE_SUPPORT_LABEL = `Vous avez indiqué que votre Mission Locale est absente de la liste. 
  Pour faire une demande d’ajout de votre Mission Locale, vous devez contacter le support.`

export function RenseignementMissionLocaleForm({
  referentielMissionsLocales,
  onMissionLocaleChoisie,
  onContacterSupport,
  onClose = () => {},
  isInModal = false,
}: RenseignementMissionLocaleFormProps) {
  const [filtreDepartement, setFiltreFiltreDepartement] = useState<string>('')
  const [MissionsLocalesFiltrees, setMissionsLocalesFiltrees] = useState<
    MissionLocale[]
  >(referentielMissionsLocales)
  const [idMissionLocaleSelectionnee, setIdMissionLocaleSelectionnee] =
    useState<ValueWithError<string | undefined>>()

  function buildOptions(): Option[] {
    return [MILO_PAS_DANS_LA_LISTE_OPTION].concat(
      MissionsLocalesFiltrees.map(({ id, nom }) => ({ id, value: nom }))
    )
  }

  function selectDepartement(departementSelectionne: string) {
    setIdMissionLocaleSelectionnee({ value: undefined })
    setFiltreFiltreDepartement(padCodeDepartement(departementSelectionne))
  }

  function missionLocaleNestPasDansLaListe() {
    return (
      idMissionLocaleSelectionnee?.value === MILO_PAS_DANS_LA_LISTE_OPTION.id
    )
  }

  function submitMissionLocaleSelectionnee(e: FormEvent) {
    e.preventDefault()
    if (!idMissionLocaleSelectionnee?.value) {
      setIdMissionLocaleSelectionnee({
        value: idMissionLocaleSelectionnee?.value,
        error:
          'Le champ ”Recherchez votre Mission Locale” est vide. Renseignez votre Mission Locale.',
      })
      return
    }

    if (missionLocaleNestPasDansLaListe()) return

    const missionLocale = referentielMissionsLocales.find(
      ({ id }) => id === idMissionLocaleSelectionnee.value
    )
    onMissionLocaleChoisie(missionLocale!)
  }

  useEffect(() => {
    const miloFiltrees =
      filtreDepartement !== ''
        ? referentielMissionsLocales.filter(({ codeDepartement }) =>
            padCodeDepartement(codeDepartement).startsWith(filtreDepartement)
          )
        : referentielMissionsLocales
    setMissionsLocalesFiltrees(miloFiltrees)
  }, [filtreDepartement, referentielMissionsLocales])

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
          {idMissionLocaleSelectionnee?.error && (
            <InputError id='mission-locale--error' className='mt-2'>
              {idMissionLocaleSelectionnee.error}
            </InputError>
          )}
          <Select
            id='mission-locale'
            required={true}
            onChange={(nouvelleMissionLocale) =>
              setIdMissionLocaleSelectionnee({ value: nouvelleMissionLocale })
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

      {missionLocaleNestPasDansLaListe() && isInModal && (
        <div className='mt-2'>
          <InformationMessage label={CONTACTER_LE_SUPPORT_LABEL} />
        </div>
      )}

      {missionLocaleNestPasDansLaListe() && !isInModal && (
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

        {!missionLocaleNestPasDansLaListe() && (
          <Button type='submit' className='mr-6'>
            Ajouter
          </Button>
        )}

        {missionLocaleNestPasDansLaListe() && (
          <a
            className={`w-fit flex items-center justify-center text-s-bold ${styles.button} ${styles.buttonTertiary}`}
            href={getUrlFormulaireSupport('MILO')}
            target='_blank'
            rel='noreferrer noopener'
            onClick={onContacterSupport}
          >
            <IconComponent
              name={IconName.OutgoingMail}
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

function padCodeDepartement(code: string): string {
  return code.padStart(2, '0')
}

import { DateTime } from 'luxon'
import React, { ReactElement, useEffect, useRef, useState } from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Periode } from 'types/dates'
import {
  getPeriodeAround as _getPeriodeAround,
  PERIODE_LENGTH_FULL_DAYS,
  toLongMonthDate,
} from 'utils/date'
import { useDebounce } from 'utils/hooks/useDebounce'

type SelecteurPeriodeProps = {
  premierJour: DateTime
  jourSemaineReference: 1 | 2 | 3 | 4 | 5 | 6 | 7
  onNouvellePeriode: (
    periode: Periode,
    opts: { label: string; shouldFocus: boolean }
  ) => void
  trackNavigation: (append?: string) => void
  className?: string
}

export function SelecteurPeriode({
  premierJour,
  jourSemaineReference,
  onNouvellePeriode,
  trackNavigation,
  className,
}: SelecteurPeriodeProps): ReactElement {
  const isFirstRender = useRef<boolean>(true)
  const aujourdhui = DateTime.now()

  const [periodeAffichee, setPeriodeAffichee] = useState<Periode>(
    getPeriodeAround(premierJour)
  )
  const [labelPeriode, setLabelPeriode] = useState<string>(
    getLabelPeriode(periodeAffichee)
  )

  const debutPeriodeRef = useRef<HTMLInputElement>(null)
  const [periodeInput, setPeriodeInput] = useState<string>(
    periodeAffichee.debut.toISODate()
  )
  const debouncedPeriode = useDebounce(periodeInput, 500)

  const regexDate = /^\d{4}-(0\d|1[0-2])-([0-2]\d|3[01])$/
  const [shouldFocusOnChange, setShouldFocusOnChange] = useState<boolean>(false)

  function getPeriodeAround(date: DateTime): Periode {
    return _getPeriodeAround(date, { jourSemaineReference })
  }

  function getLabelPeriode({ debut, fin }: Periode): string {
    return `du ${toLongMonthDate(debut)} au ${toLongMonthDate(fin)}`
  }

  async function allerPeriodePrecedente() {
    setPeriodeAffichee({
      debut: periodeAffichee.debut.minus({ day: PERIODE_LENGTH_FULL_DAYS }),
      fin: periodeAffichee.fin.minus({ day: PERIODE_LENGTH_FULL_DAYS }),
    })
    setShouldFocusOnChange(false)
    trackNavigation('passés')
  }

  async function allerPeriodeSuivante() {
    setPeriodeAffichee({
      debut: periodeAffichee.debut.plus({ day: PERIODE_LENGTH_FULL_DAYS }),
      fin: periodeAffichee.fin.plus({ day: PERIODE_LENGTH_FULL_DAYS }),
    })
    setShouldFocusOnChange(false)
    trackNavigation('futurs')
  }

  async function allerPeriodeActuelle() {
    setPeriodeAffichee(getPeriodeAround(aujourdhui))
    setShouldFocusOnChange(true)
    trackNavigation()
  }

  function changerPeriode(debutPeriodeInput: string) {
    if (!regexDate.test(debutPeriodeInput)) return

    setPeriodeAffichee(getPeriodeAround(DateTime.fromISO(debutPeriodeInput)))
    setShouldFocusOnChange(true)
    trackNavigation('manuel')
  }

  useEffect(() => {
    const nouveauLabel = getLabelPeriode(periodeAffichee)
    setLabelPeriode(nouveauLabel)
    onNouvellePeriode(periodeAffichee, {
      label: nouveauLabel,
      shouldFocus: shouldFocusOnChange,
    })
    debutPeriodeRef.current!.value = periodeAffichee.debut.toISODate()
  }, [periodeAffichee])

  useEffect(() => {
    if (!isFirstRender.current) changerPeriode(debouncedPeriode)
  }, [debouncedPeriode])

  useEffect(() => {
    isFirstRender.current = false
    return () => {
      isFirstRender.current = true
    }
  }, [])

  return (
    <fieldset
      className={'flex flex-wrap items-center gap-2 w-fit ' + (className ?? '')}
    >
      <legend className='sr-only' aria-live='polite' aria-atomic={true}>
        Période : {labelPeriode}
      </legend>

      <button onClick={allerPeriodePrecedente} type='button'>
        <IconComponent
          name={IconName.ChevronLeft}
          className='w-6 h-6 fill-primary hover:fill-primary-darken'
          focusable={false}
          role='img'
          aria-label={
            'Aller à la période précédente ' +
            getLabelPeriode(
              getPeriodeAround(
                periodeAffichee.debut.minus({ day: PERIODE_LENGTH_FULL_DAYS })
              )
            )
          }
          title={
            'Aller à la période précédente ' +
            getLabelPeriode(
              getPeriodeAround(
                periodeAffichee.debut.minus({ day: PERIODE_LENGTH_FULL_DAYS })
              )
            )
          }
        />
      </button>

      <label htmlFor='debut-periode'>
        <span className='sr-only'>Début période : </span>
        Du{' '}
      </label>
      <input
        ref={debutPeriodeRef}
        id='debut-periode'
        type='date'
        defaultValue={periodeAffichee.debut.toISODate()}
        onChange={(e) => setPeriodeInput(e.target.value)}
        step={7}
        className='text-base-bold border-b'
      />

      <label htmlFor='fin-periode'>
        <span className='sr-only'>Fin période : </span>
        au{' '}
      </label>
      <input
        id='fin-periode'
        type='date'
        value={periodeAffichee.fin.toISODate()}
        readOnly={true}
      />

      <button onClick={allerPeriodeSuivante} type='button'>
        <IconComponent
          name={IconName.ChevronRight}
          className='w-6 h-6 fill-primary hover:fill-primary-darken'
          focusable={false}
          role='img'
          aria-label={
            `Aller à la période suivante ` +
            getLabelPeriode(
              getPeriodeAround(
                periodeAffichee.debut.plus({ day: PERIODE_LENGTH_FULL_DAYS })
              )
            )
          }
          title={
            `Aller à la période suivante ` +
            getLabelPeriode(
              getPeriodeAround(
                periodeAffichee.debut.plus({ day: PERIODE_LENGTH_FULL_DAYS })
              )
            )
          }
        />
      </button>

      <Button
        type='button'
        style={ButtonStyle.SECONDARY}
        onClick={allerPeriodeActuelle}
        disabled={
          Math.abs(periodeAffichee.debut.diff(aujourdhui, 'days').days) <
          PERIODE_LENGTH_FULL_DAYS
        }
        className='py-0!'
        label={`Aller à la période en cours ${getLabelPeriode(getPeriodeAround(aujourdhui))}`}
      >
        Période en cours
      </Button>
    </fieldset>
  )
}

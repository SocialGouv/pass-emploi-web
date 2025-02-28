import { DateTime } from 'luxon'
import React, { ReactElement, useEffect, useRef, useState } from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { toLongMonthDate, toShortDate } from 'utils/date'
import { useDebounce } from 'utils/hooks/useDebounce'

type SelecteurPeriodeProps = {
  onNouvellePeriode: (
    periode: { index: number; dateDebut: DateTime; dateFin: DateTime },
    opts: { label: string; shouldFocus: boolean }
  ) => void
  trackNavigation: (append?: string) => void
  periodeCourante: number
}

export function SelecteurPeriode({
  onNouvellePeriode,
  trackNavigation,
  periodeCourante,
}: SelecteurPeriodeProps): ReactElement {
  const AUJOURDHUI = DateTime.now().startOf('day')
  const isFirstRender = useRef<boolean>(true)

  const [indexPeriodeAffichee, setIndexPeriodeAffichee] = useState<number>(
    periodeCourante ?? 0
  )
  const [periodeAffichee, setPeriodeAffichee] = useState<{
    debut: DateTime
    fin: DateTime
    longLabel: string
  }>(() => {
    const debut = jourDeDebutDeLaPeriode(indexPeriodeAffichee)
    const fin = jourDeFinDeLaPeriode(indexPeriodeAffichee)
    return { debut, fin, longLabel: labelPeriode(debut, fin, 'long') }
  })

  const debutPeriodeRef = useRef<HTMLInputElement>(null)
  const [periodeInput, setPeriodeInput] = useState<string>(
    periodeAffichee.debut.toISODate()
  )
  const debouncedPeriode = useDebounce(periodeInput, 500)

  const regexDate = /^\d{4}-(0\d|1[0-2])-([0-2]\d|3[01])$/
  const [shouldFocusOnChange, setShouldFocusOnChange] = useState<boolean>(false)

  function jourDeDebutDeLaPeriode(indexPeriode: number): DateTime {
    return AUJOURDHUI.plus({
      day: 7 * indexPeriode,
    })
  }

  function jourDeFinDeLaPeriode(indexPeriode: number): DateTime {
    return jourDeDebutDeLaPeriode(indexPeriode).plus({ day: 6 }).endOf('day')
  }

  function labelPeriode(
    debut: DateTime,
    fin: DateTime,
    format: string
  ): string {
    const toFormat = format === 'short' ? toShortDate : toLongMonthDate
    return `du ${toFormat(debut)} au ${toFormat(fin)}`
  }

  async function allerPeriodePrecedente() {
    setIndexPeriodeAffichee(indexPeriodeAffichee - 1)
    setShouldFocusOnChange(false)
    trackNavigation('passés')
  }

  async function allerPeriodeSuivante() {
    setIndexPeriodeAffichee(indexPeriodeAffichee + 1)
    setShouldFocusOnChange(false)
    trackNavigation('futurs')
  }

  async function allerPeriodeActuelle() {
    setIndexPeriodeAffichee(0)
    setShouldFocusOnChange(true)
    trackNavigation()
  }

  function changerPeriode(debutPeriodeInput: string) {
    if (!regexDate.test(debutPeriodeInput)) return

    const debutPeriode = DateTime.fromISO(debutPeriodeInput).set({
      weekday: AUJOURDHUI.weekday,
    })
    setIndexPeriodeAffichee(debutPeriode.diff(AUJOURDHUI, 'week').weeks)
    setShouldFocusOnChange(true)
    trackNavigation('manuel')
  }

  useEffect(() => {
    const debut = jourDeDebutDeLaPeriode(indexPeriodeAffichee)
    const fin = jourDeFinDeLaPeriode(indexPeriodeAffichee)
    const label = labelPeriode(debut, fin, 'long')
    onNouvellePeriode(
      { index: indexPeriodeAffichee, dateDebut: debut, dateFin: fin },
      { label, shouldFocus: shouldFocusOnChange }
    )
    setPeriodeAffichee({ debut, fin, longLabel: label })
    debutPeriodeRef.current!.value = debut.toISODate()
  }, [indexPeriodeAffichee])

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
    <fieldset className='flex flex-wrap items-center gap-2 w-fit'>
      <legend className='sr-only' aria-live='polite' aria-atomic={true}>
        Période : {periodeAffichee.longLabel}
      </legend>

      <button onClick={allerPeriodePrecedente} type='button'>
        <IconComponent
          name={IconName.ChevronLeft}
          className='w-6 h-6 fill-primary hover:fill-primary_darken'
          focusable={false}
          role='img'
          aria-label={
            'Aller à la période précédente ' +
            labelPeriode(
              jourDeDebutDeLaPeriode(indexPeriodeAffichee - 1),
              jourDeFinDeLaPeriode(indexPeriodeAffichee - 1),
              'long'
            )
          }
          title={
            'Aller à la période précédente ' +
            labelPeriode(
              jourDeDebutDeLaPeriode(indexPeriodeAffichee - 1),
              jourDeFinDeLaPeriode(indexPeriodeAffichee - 1),
              'long'
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
          className='w-6 h-6 fill-primary hover:fill-primary_darken'
          focusable={false}
          role='img'
          aria-label={
            `Aller à la période suivante ` +
            labelPeriode(
              jourDeDebutDeLaPeriode(indexPeriodeAffichee + 1),
              jourDeFinDeLaPeriode(indexPeriodeAffichee + 1),
              'long'
            )
          }
          title={
            `Aller à la période suivante ` +
            labelPeriode(
              jourDeDebutDeLaPeriode(indexPeriodeAffichee + 1),
              jourDeFinDeLaPeriode(indexPeriodeAffichee + 1),
              'long'
            )
          }
        />
      </button>

      <Button
        type='button'
        style={ButtonStyle.SECONDARY}
        onClick={allerPeriodeActuelle}
        disabled={indexPeriodeAffichee === 0}
        className='py-0!'
        label={`Aller à la période en cours ${labelPeriode(
          jourDeDebutDeLaPeriode(0),
          jourDeFinDeLaPeriode(0),
          'long'
        )}`}
      >
        Période en cours
      </Button>
    </fieldset>
  )
}

import { DateTime } from 'luxon'
import React, { ReactElement, useEffect, useRef, useState } from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Periode } from 'types/dates'
import {
  getPeriodeComprenant as _getPeriodeComprenant,
  PERIODE_LENGTH_FULL_DAYS,
} from 'utils/date'
import { useDebounce } from 'utils/hooks/useDebounce'

type SelecteurPeriodeProps = {
  premierJour: DateTime
  jourSemaineReference: 1 | 2 | 3 | 4 | 5 | 6 | 7
  onNouvellePeriode: (periode: Periode, opts: { shouldFocus: boolean }) => void
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

  const periodeEnCours = getPeriodeComprenant(DateTime.now())
  const [periodeAffichee, setPeriodeAffichee] = useState<Periode>(
    getPeriodeComprenant(premierJour)
  )

  const [periodePrecedente, setPeriodePrecedente] = useState<Periode>(
    getPeriodeComprenant(premierJour.minus({ day: PERIODE_LENGTH_FULL_DAYS }))
  )
  const [periodeSuivante, setPeriodeSuivante] = useState<Periode>(
    getPeriodeComprenant(premierJour.plus({ day: PERIODE_LENGTH_FULL_DAYS }))
  )

  const debutPeriodeRef = useRef<HTMLInputElement>(null)
  const [periodeInput, setPeriodeInput] = useState<string>(
    periodeAffichee.debut.toISODate()
  )
  const debouncedPeriode = useDebounce(periodeInput, 500)
  const regexDate = /^\d{4}-(0\d|1[0-2])-([0-2]\d|3[01])$/
  const [shouldFocusOnChange, setShouldFocusOnChange] = useState<boolean>(false)

  function getPeriodeComprenant(date: DateTime): Periode {
    return _getPeriodeComprenant(date, { jourSemaineReference })
  }

  async function allerPeriodePrecedente() {
    setPeriodeAffichee(periodePrecedente)
    setShouldFocusOnChange(false)
    trackNavigation('passés')
  }

  async function allerPeriodeSuivante() {
    setPeriodeAffichee(periodeSuivante)
    setShouldFocusOnChange(false)
    trackNavigation('futurs')
  }

  async function allerPeriodeActuelle() {
    setPeriodeAffichee(periodeEnCours)
    setShouldFocusOnChange(true)
    trackNavigation()
  }

  function changerPeriode(debutPeriodeInput: string) {
    if (!regexDate.test(debutPeriodeInput)) return

    setPeriodeAffichee(
      getPeriodeComprenant(DateTime.fromISO(debutPeriodeInput))
    )
    setShouldFocusOnChange(true)
    trackNavigation('manuel')
  }

  function isPeriodeEnCoursEstAffichee(): boolean {
    return (
      Math.abs(periodeAffichee.debut.diff(periodeEnCours.debut, 'days').days) <
      PERIODE_LENGTH_FULL_DAYS
    )
  }

  useEffect(() => {
    isFirstRender.current = false
    return () => {
      isFirstRender.current = true
    }
  }, [])

  useEffect(() => {
    onNouvellePeriode(periodeAffichee, { shouldFocus: shouldFocusOnChange })
    debutPeriodeRef.current!.value = periodeAffichee.debut.toISODate()
  }, [periodeAffichee])

  useEffect(() => {
    setPeriodePrecedente(
      getPeriodeComprenant(
        periodeAffichee.debut.minus({ day: PERIODE_LENGTH_FULL_DAYS })
      )
    )
    setPeriodeSuivante(
      getPeriodeComprenant(
        periodeAffichee.debut.plus({ day: PERIODE_LENGTH_FULL_DAYS })
      )
    )
  }, [periodeAffichee])

  useEffect(() => {
    if (!isFirstRender.current) changerPeriode(debouncedPeriode)
  }, [debouncedPeriode])

  return (
    <fieldset
      className={'flex flex-wrap items-center gap-2 w-fit ' + (className ?? '')}
    >
      <legend className='sr-only' aria-live='polite' aria-atomic={true}>
        Période : {periodeAffichee.label}
      </legend>

      <button onClick={allerPeriodePrecedente} type='button'>
        <IconComponent
          name={IconName.ChevronLeft}
          className='w-6 h-6 fill-primary hover:fill-primary-darken'
          focusable={false}
          role='img'
          aria-label={
            'Aller à la période précédente ' + periodePrecedente.label
          }
          title={'Aller à la période précédente ' + periodePrecedente.label}
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
          aria-label={`Aller à la période suivante ` + periodeSuivante.label}
          title={`Aller à la période suivante ` + periodeSuivante.label}
        />
      </button>

      <Button
        type='button'
        style={ButtonStyle.SECONDARY}
        onClick={allerPeriodeActuelle}
        disabled={isPeriodeEnCoursEstAffichee()}
        className='py-0!'
        label={`Aller à la période en cours ${periodeEnCours.label}`}
      >
        Période en cours
      </Button>
    </fieldset>
  )
}

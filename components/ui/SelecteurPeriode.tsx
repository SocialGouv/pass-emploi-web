import { DateTime } from 'luxon'
import React, { ReactElement, useEffect, useState } from 'react'

import Button, { ButtonStyle } from './Button/Button'
import IconComponent, { IconName } from './IconComponent'

import { toLongMonthDate, toShortDate } from 'utils/date'

type SelecteurPeriodeProps = {
  onNouvellePeriode: (
    indexPeriode: number,
    dateDebut: DateTime,
    dateFin: DateTime,
    label: string
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

  const [indexPeriodeAffichee, setIndexPeriodeAffichee] = useState<number>(
    periodeCourante ?? 0
  )
  const [periodeAffiche, setPeriodeAffiche] = useState<{
    debut: DateTime
    fin: DateTime
    longLabel: string
  }>(() => {
    const debut = jourDeDebutDeLaPeriode(indexPeriodeAffichee)
    const fin = jourDeFinDeLaPeriode(indexPeriodeAffichee)
    return { debut, fin, longLabel: labelPeriode(debut, fin, 'long') }
  })

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
    trackNavigation('passés')
  }

  async function allerPeriodeSuivante() {
    setIndexPeriodeAffichee(indexPeriodeAffichee + 1)
    trackNavigation('futurs')
  }

  async function allerPeriodeActuelle() {
    setIndexPeriodeAffichee(0)
    trackNavigation()
  }

  useEffect(() => {
    const debut = jourDeDebutDeLaPeriode(indexPeriodeAffichee)
    const fin = jourDeFinDeLaPeriode(indexPeriodeAffichee)
    const label = labelPeriode(debut, fin, 'long')
    onNouvellePeriode(indexPeriodeAffichee, debut, fin, label)
    setPeriodeAffiche({ debut, fin, longLabel: label })
  }, [indexPeriodeAffichee])

  return (
    <div className='flex flex-wrap items-end gap-6 w-fit'>
      <p
        className='flex flex-col text-base-medium'
        aria-live='polite'
        aria-atomic={true}
      >
        Période :{' '}
        <span
          className='text-m-bold text-primary self-center'
          aria-label={labelPeriode(
            periodeAffiche.debut,
            periodeAffiche.fin,
            'long'
          )}
        >
          {labelPeriode(periodeAffiche.debut, periodeAffiche.fin, 'short')}
        </span>
      </p>

      <div className='flex items-center col-start-2 row-start-2'>
        <button
          aria-label={
            `Aller à la période précédente ` +
            labelPeriode(
              jourDeDebutDeLaPeriode(indexPeriodeAffichee - 1),
              jourDeFinDeLaPeriode(indexPeriodeAffichee - 1),
              'long'
            )
          }
          onClick={allerPeriodePrecedente}
          type='button'
        >
          <IconComponent
            name={IconName.ChevronLeft}
            className='w-6 h-6 fill-primary mr-2 hover:fill-primary_darken'
            focusable={false}
            title='Aller à la période précédente'
          />
        </button>
        <Button
          type='button'
          style={ButtonStyle.SECONDARY}
          onClick={allerPeriodeActuelle}
          disabled={indexPeriodeAffichee === 0}
        >
          <span className='sr-only'>Aller à la </span>Période en cours
          <span className='sr-only'> {periodeAffiche.longLabel}</span>
        </Button>
        <button
          aria-label={
            `Aller à la période suivante ` +
            labelPeriode(
              jourDeDebutDeLaPeriode(indexPeriodeAffichee + 1),
              jourDeFinDeLaPeriode(indexPeriodeAffichee + 1),
              'long'
            )
          }
          onClick={allerPeriodeSuivante}
          type='button'
        >
          <IconComponent
            name={IconName.ChevronRight}
            className='w-6 h-6 fill-primary ml-2 hover:fill-primary_darken'
            focusable={false}
            title='Aller à la période suivante'
          />
        </button>
      </div>
    </div>
  )
}

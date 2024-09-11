import { DateTime } from 'luxon'
import React, { ReactElement, useEffect, useState } from 'react'

import Button, { ButtonStyle } from './Button/Button'
import IconComponent, { IconName } from './IconComponent'

import { toLongMonthDate, toShortDate } from 'utils/date'

type SelecteurPeriodeProps = {
  onNouvellePeriode: (
    indexPeriode: number,
    dateDebut: DateTime,
    dateFin: DateTime
  ) => Promise<void>
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
  }>({
    debut: jourDeDebutDeLaPeriode(indexPeriodeAffichee),
    fin: jourDeFinDeLaPeriode(indexPeriodeAffichee),
  })

  function jourDeDebutDeLaPeriode(indexPeriode: number): DateTime {
    return AUJOURDHUI.plus({
      day: 7 * indexPeriode,
    })
  }

  function jourDeFinDeLaPeriode(indexPeriode: number): DateTime {
    return jourDeDebutDeLaPeriode(indexPeriode).plus({ day: 6 }).endOf('day')
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
    const debutPeriodeAffichee = jourDeDebutDeLaPeriode(indexPeriodeAffichee)
    const finPeriodeAffichee = jourDeFinDeLaPeriode(indexPeriodeAffichee)
    onNouvellePeriode(
      indexPeriodeAffichee,
      debutPeriodeAffichee,
      finPeriodeAffichee
    )
    setPeriodeAffiche({ debut: debutPeriodeAffichee, fin: finPeriodeAffichee })
  }, [indexPeriodeAffichee])

  return (
    <div className='grid grid-rows-[repeat(2,auto)] grid-cols-[repeat(2,auto)] gap-x-6'>
      <p
        className='grid grid-rows-subgrid grid-cols-1 row-span-2 text-base-medium'
        aria-live='polite'
        aria-atomic={true}
      >
        Période :{' '}
        <span className='text-m-bold text-primary self-center'>
          du {toShortDate(periodeAffiche.debut)} au{' '}
          {toShortDate(periodeAffiche.fin)}
        </span>
      </p>

      <div className='flex items-center col-start-2 row-start-2'>
        <button
          aria-label={`Aller à la période précédente du ${toLongMonthDate(jourDeDebutDeLaPeriode(indexPeriodeAffichee - 1))} au ${toLongMonthDate(jourDeFinDeLaPeriode(indexPeriodeAffichee - 1))}`}
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
        >
          <span className='sr-only'>Aller à la </span>Période en cours
          <span className='sr-only'>
            {' '}
            du {toLongMonthDate(periodeAffiche.debut)} au{' '}
            {toLongMonthDate(periodeAffiche.fin)}
          </span>
        </Button>
        <button
          aria-label={`Aller à la période suivante du ${toLongMonthDate(jourDeDebutDeLaPeriode(indexPeriodeAffichee + 1))} au ${toLongMonthDate(jourDeFinDeLaPeriode(indexPeriodeAffichee + 1))}`}
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

import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'

import Button, { ButtonStyle } from './Button/Button'
import IconComponent, { IconName } from './IconComponent'

import { toShortDate } from 'utils/date'

type SelecteurPeriodeProps = {
  onNouvellePeriode: (dateDebut: DateTime, dateFin: DateTime) => Promise<void>
  trackNavigation: (append?: string) => void
  nombreJours: number
  periodeCourante: number
  changerPeriode: (toto: number) => void
}

export function SelecteurPeriode({
  onNouvellePeriode,
  nombreJours,
  trackNavigation,
  periodeCourante,
  changerPeriode,
}: SelecteurPeriodeProps): JSX.Element {
  const [indexPeriodeAffichee, setIndexPeriodeAffichee] = useState<number>(
    periodeCourante ?? 0
  )
  const AUJOURDHUI = DateTime.now().startOf('day')

  function jourDeDebutDeLaPeriode(indexPeriode: number): DateTime {
    return AUJOURDHUI.plus({
      day: nombreJours * indexPeriode,
    })
  }

  function jourDeFinDeLaPeriode(indexPeriode: number): DateTime {
    return jourDeDebutDeLaPeriode(indexPeriode)
      .plus({ day: nombreJours - 1 })
      .endOf('day')
  }

  async function allerPeriodePrecedente() {
    console.log('>>>>', periodeCourante)
    changerPeriode(periodeCourante - 1)
    setIndexPeriodeAffichee(indexPeriodeAffichee - 1)
    trackNavigation('passés')
  }

  async function allerPeriodeSuivante() {
    changerPeriode(periodeCourante + 1)
    setIndexPeriodeAffichee(indexPeriodeAffichee + 1)
    trackNavigation('futurs')
  }

  async function allerPeriodeActuelle() {
    changerPeriode(0)
    setIndexPeriodeAffichee(0)
    trackNavigation()
  }

  useEffect(() => {
    onNouvellePeriode(
      jourDeDebutDeLaPeriode(indexPeriodeAffichee),
      jourDeFinDeLaPeriode(indexPeriodeAffichee)
    )
  }, [indexPeriodeAffichee])

  return (
    <>
      <p className='text-base-medium'>Période :</p>

      <div className='flex items-center mt-1'>
        <p className='text-m-bold text-primary mr-6'>
          du {toShortDate(jourDeDebutDeLaPeriode(indexPeriodeAffichee))} au{' '}
          {toShortDate(jourDeFinDeLaPeriode(indexPeriodeAffichee))}
        </p>
        <button
          aria-label='Aller à la période précédente'
          onClick={allerPeriodePrecedente}
        >
          <IconComponent
            name={IconName.ChevronLeft}
            className='w-6 h-6 fill-primary mr-2 hover:fill-primary_darken'
            focusable='false'
            title='Aller à la période précédente'
          />
        </button>
        <Button
          type='button'
          style={ButtonStyle.SECONDARY}
          onClick={allerPeriodeActuelle}
        >
          <span className='sr-only'>Aller à la </span>Période en cours
        </Button>
        <button
          aria-label='Aller à la période suivante'
          onClick={allerPeriodeSuivante}
        >
          <IconComponent
            name={IconName.ChevronRight}
            className='w-6 h-6 fill-primary ml-2 hover:fill-primary_darken'
            focusable='false'
            title='Aller à la période suivante'
          />
        </button>
      </div>
    </>
  )
}

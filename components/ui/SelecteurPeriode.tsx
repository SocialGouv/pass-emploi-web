import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'

import Button, { ButtonStyle } from './Button/Button'
import IconComponent, { IconName } from './IconComponent'

import { toShortDate } from 'utils/date'

type SelecteurPeriodeProps = {
  onNouvellePeriode: (dateDebut: DateTime, dateFin: DateTime) => Promise<void>
  trackNavigation: (append?: string) => void
  nombreJours: number
}

export function SelecteurPeriode({
  onNouvellePeriode,
  nombreJours,
  trackNavigation,
}: SelecteurPeriodeProps): JSX.Element {
  const [indexPeriodeAffichee, setIndexPeriodeAffichee] = useState<number>(0)
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
    onNouvellePeriode(
      jourDeDebutDeLaPeriode(indexPeriodeAffichee),
      jourDeFinDeLaPeriode(indexPeriodeAffichee)
    )
  }, [indexPeriodeAffichee])

  return (
    <>
      <div className='flex justify-between items-center'>
        <p className='text-base-medium'>Période :</p>
        <Button
          type='button'
          style={ButtonStyle.SECONDARY}
          onClick={allerPeriodeActuelle}
        >
          <span className='sr-only'>Aller à la</span> période en cours
        </Button>
      </div>

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
            className='w-6 h-6 fill-primary hover:fill-primary_darken'
            focusable='false'
            title='Aller à la période précédente'
          />
        </button>
        <button
          aria-label='Aller à la période suivante'
          onClick={allerPeriodeSuivante}
        >
          <IconComponent
            name={IconName.ChevronRight}
            className='w-6 h-6 fill-primary ml-8 hover:fill-primary_darken'
            focusable='false'
            title='Aller à la période suivante'
          />
        </button>
      </div>
    </>
  )
}

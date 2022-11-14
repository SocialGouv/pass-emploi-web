import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'

import Button, { ButtonStyle } from './Button/Button'
import IconComponent, { IconName } from './IconComponent'

import { toShortDate } from 'utils/date'

type SelecteurPeriodeProps = {
  onNouvellePeriode: (dateDebut: DateTime, dateFin: DateTime) => Promise<void>
  trackNavigation: (append?: string) => void
}

export function SelecteurPeriode({
  onNouvellePeriode,
  trackNavigation,
}: SelecteurPeriodeProps): JSX.Element {
  const [index7JoursAffiches, setIndex7JoursAffiches] = useState<number>(0)
  const AUJOURDHUI = DateTime.now().startOf('day')

  function jourDeDebutDeLaPeriode(index7Jours?: number): DateTime {
    return AUJOURDHUI.plus({
      day: 7 * (index7Jours ?? index7JoursAffiches),
    })
  }

  function jourDeFinDeLaPeriode(index7Jours?: number): DateTime {
    return jourDeDebutDeLaPeriode(index7Jours ?? index7JoursAffiches)
      .plus({ day: 6 })
      .endOf('day')
  }

  async function aller7JoursPrecedents() {
    setIndex7JoursAffiches(index7JoursAffiches - 1)
    trackNavigation('passés')
  }

  async function aller7JoursSuivants() {
    setIndex7JoursAffiches(index7JoursAffiches + 1)
    trackNavigation('futurs')
  }

  async function aller7JoursActuels() {
    setIndex7JoursAffiches(0)
    trackNavigation()
  }

  useEffect(() => {
    onNouvellePeriode(
      jourDeDebutDeLaPeriode(index7JoursAffiches),
      jourDeFinDeLaPeriode(index7JoursAffiches)
    )
  }, [index7JoursAffiches])

  return (
    <>
      <div className='flex justify-between items-center'>
        <p className='text-base-medium'>Période :</p>
        <Button
          type='button'
          style={ButtonStyle.SECONDARY}
          onClick={aller7JoursActuels}
        >
          <span className='sr-only'>Aller à la</span> Semaine en cours
        </Button>
      </div>

      <div className='flex items-center mt-1'>
        <p className='text-m-bold text-primary mr-6'>
          du {toShortDate(jourDeDebutDeLaPeriode(index7JoursAffiches))} au{' '}
          {toShortDate(jourDeFinDeLaPeriode(index7JoursAffiches))}
        </p>
        <button
          aria-label='Aller à la semaine précédente'
          onClick={aller7JoursPrecedents}
        >
          <IconComponent
            name={IconName.ChevronLeft}
            className='w-6 h-6 fill-primary hover:fill-primary_darken'
            focusable='false'
            title='Aller à la semaine précédente'
          />
        </button>
        <button
          aria-label='Aller à la semaine suivante'
          onClick={aller7JoursSuivants}
        >
          <IconComponent
            name={IconName.ChevronRight}
            className='w-6 h-6 fill-primary ml-8 hover:fill-primary_darken'
            focusable='false'
            title='Aller à la semaine suivante'
          />
        </button>
      </div>
    </>
  )
}

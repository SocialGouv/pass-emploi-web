import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'

import TableauRdv from 'components/rdv/TableauRdv'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { RdvListItem } from 'interfaces/rdv'
import { toShortDate } from 'utils/date'

type OngletAgendaConseillerProps = {
  idConseiller: string | undefined
  recupererRdvs: (
    idConseiller: string,
    dateDebut: DateTime,
    dateFin: DateTime
  ) => Promise<RdvListItem[]>
  trackNavigation: (append?: string) => void
}
export function OngletAgendaConseiller({
  idConseiller,
  recupererRdvs,
  trackNavigation,
}: OngletAgendaConseillerProps) {
  const [rdvs, setRdvs] = useState<RdvListItem[]>([])

  const AUJOURDHUI = DateTime.now().startOf('day')
  const [index7JoursAffiches, setIndex7JoursAffiches] = useState<number>(0)

  async function allerRdvs7JoursPrecedents() {
    setIndex7JoursAffiches(index7JoursAffiches - 1)
    trackNavigation('passés')
  }

  async function allerRdvs7JoursActuels() {
    setIndex7JoursAffiches(0)
    trackNavigation()
  }

  async function allerRdvs7JoursSuivants() {
    setIndex7JoursAffiches(index7JoursAffiches + 1)
    trackNavigation('futurs')
  }

  async function chargerRdvs7Jours(index7Jours: number) {
    const rdvs7Jours = await recupererRdvs(
      idConseiller!,
      jourDeDebutDesRdvs(index7Jours),
      jourDeFinDesRdvs(index7Jours)
    )
    setRdvs(rdvs7Jours)
  }

  function jourDeDebutDesRdvs(index7Jours?: number): DateTime {
    return AUJOURDHUI.plus({
      day: 7 * (index7Jours ?? index7JoursAffiches),
    })
  }

  function jourDeFinDesRdvs(index7Jours?: number): DateTime {
    return jourDeDebutDesRdvs(index7Jours ?? index7JoursAffiches)
      .plus({ day: 6 })
      .endOf('day')
  }

  useEffect(() => {
    if (idConseiller) chargerRdvs7Jours(index7JoursAffiches)
  }, [idConseiller, index7JoursAffiches])

  return (
    <>
      <div className='mb-8'>
        <div className='flex justify-between items-center'>
          <p className='text-base-medium'>Période :</p>
          <Button
            type='button'
            style={ButtonStyle.SECONDARY}
            onClick={allerRdvs7JoursActuels}
          >
            <span className='sr-only'>Aller à la</span> Semaine en cours
          </Button>
        </div>

        <div className='flex items-center mt-1'>
          <p className='text-m-bold text-primary mr-6'>
            du {toShortDate(jourDeDebutDesRdvs())} au{' '}
            {toShortDate(jourDeFinDesRdvs())}
          </p>
          <button
            aria-label='Aller à la semaine précédente'
            onClick={allerRdvs7JoursPrecedents}
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
            onClick={allerRdvs7JoursSuivants}
          >
            <IconComponent
              name={IconName.ChevronRight}
              className='w-6 h-6 fill-primary ml-8 hover:fill-primary_darken'
              focusable='false'
              title='Aller à la semaine suivante'
            />
          </button>
        </div>
      </div>

      <TableauRdv
        idConseiller={idConseiller ?? ''}
        rdvs={rdvs ?? []}
        withIntercalaires={true}
      />
    </>
  )
}

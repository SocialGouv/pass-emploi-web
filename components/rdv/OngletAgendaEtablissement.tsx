import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'

import Button, { ButtonStyle } from '../ui/Button/Button'

import EmptyStateImage from 'assets/images/empty_state.svg'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Tag } from 'components/ui/Indicateurs/Tag'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import { HeaderCell } from 'components/ui/Table/HeaderCell'
import RowCell from 'components/ui/Table/RowCell'
import TableLayout from 'components/ui/Table/TableLayout'
import { TBody } from 'components/ui/Table/TBody'
import { THead } from 'components/ui/Table/THead'
import { TR } from 'components/ui/Table/TR'
import { AnimationCollective } from 'interfaces/rdv'
import {
  TIME_24_H_SEPARATOR,
  toFrenchFormat,
  toShortDate,
  WEEKDAY_MONTH_LONG,
} from 'utils/date'

type OngletAgendaEtablissementProps = {
  idEtablissement: string | undefined
  recupererAnimationsCollectives: (
    idEtablissement: string,
    dateDebut: DateTime,
    dateFin: DateTime
  ) => Promise<AnimationCollective[]>
  trackNavigation: (append?: string) => void
}
export function OngletAgendaEtablissement({
  idEtablissement,
  recupererAnimationsCollectives,
  trackNavigation,
}: OngletAgendaEtablissementProps) {
  const [animationsCollectives, setAnimationsCollectives] =
    useState<AnimationCollective[]>()

  const AUJOURDHUI = DateTime.now().startOf('day')
  const [index7JoursAffiches, setIndex7JoursAffiches] = useState<number>(0)

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

  async function allerRdvs7JoursPrecedents() {
    setIndex7JoursAffiches(index7JoursAffiches - 1)
    trackNavigation('passés')
  }

  async function allerRdvs7JoursSuivants() {
    setIndex7JoursAffiches(index7JoursAffiches + 1)
    trackNavigation('futurs')
  }

  async function allerRdvs7JoursActuels() {
    setIndex7JoursAffiches(0)
    trackNavigation()
  }

  async function chargerRdvs7Jours(index7Jours: number) {
    const rdvs7Jours = await recupererAnimationsCollectives(
      idEtablissement!,
      jourDeDebutDesRdvs(index7Jours),
      jourDeFinDesRdvs(index7Jours)
    )
    setAnimationsCollectives(rdvs7Jours)
  }

  function labelLien(ac: AnimationCollective): string {
    return `Consulter ${ac.type} ${statusProps(ac).label} du ${fullDate(
      ac
    )} à ${heure(ac)}`
  }

  function statusProps({ type, statut }: AnimationCollective): {
    label: string
    color: string
  } {
    switch (statut) {
      case 'A_VENIR':
        return { label: 'À venir', color: 'accent_1' }
      case 'A_CLOTURER':
        return { label: 'À clore', color: 'warning' }
      case 'CLOTUREE':
        return {
          label: type === 'Atelier' ? 'Clos' : 'Close',
          color: 'accent_2',
        }
    }
  }

  function fullDate({ date }: AnimationCollective): string {
    return toFrenchFormat(date, WEEKDAY_MONTH_LONG)
  }

  function heure({ date }: AnimationCollective): string {
    return toFrenchFormat(date, TIME_24_H_SEPARATOR)
  }

  function tagType({ type }: AnimationCollective): JSX.Element {
    const color = type === 'Atelier' ? 'accent_2' : 'accent_4'
    const iconName =
      type === 'Information collective' ? IconName.ImportantOutline : undefined
    return (
      <Tag
        label={type}
        color={color}
        backgroundColor={color + '_lighten'}
        iconName={iconName}
      />
    )
  }

  function tagStatut(ac: AnimationCollective): JSX.Element {
    const { label, color } = statusProps(ac)
    return (
      <Tag label={label} color={color} backgroundColor={color + '_lighten'} />
    )
  }

  useEffect(() => {
    if (idEtablissement) chargerRdvs7Jours(index7JoursAffiches)
  }, [idEtablissement, index7JoursAffiches])

  return (
    <>
      {!animationsCollectives && <SpinningLoader />}
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

      {animationsCollectives && animationsCollectives.length === 0 && (
        <div className='flex flex-col justify-center items-center'>
          <EmptyStateImage
            focusable='false'
            aria-hidden='true'
            className='w-[360px] h-[200px]'
          />
          <p className='mt-4 text-base-medium w-2/3 text-center'>
            Aucune animation collective dans votre établissement.
          </p>
        </div>
      )}

      {animationsCollectives && animationsCollectives.length > 0 && (
        <TableLayout caption='Liste des animations collectives de mon établissement'>
          <THead>
            <HeaderCell>Date</HeaderCell>
            <HeaderCell>Horaires</HeaderCell>
            <HeaderCell>Titre</HeaderCell>
            <HeaderCell>Type</HeaderCell>
            <HeaderCell>Statut</HeaderCell>
          </THead>
          <TBody>
            {animationsCollectives.map((ac) => (
              <TR
                key={ac.id}
                href={'/mes-jeunes/edition-rdv?idRdv=' + ac.id}
                label={labelLien(ac)}
              >
                <RowCell className='capitalize'>{fullDate(ac)}</RowCell>
                <RowCell>
                  {heure(ac)} - {ac.duree} min
                </RowCell>
                <RowCell>{ac.titre}</RowCell>
                <RowCell>{tagType(ac)}</RowCell>
                <RowCell>
                  <div className='flex items-center justify-between'>
                    {tagStatut(ac)}
                    <IconComponent
                      name={IconName.ChevronRight}
                      focusable={false}
                      aria-hidden={true}
                      className='w-6 h-6 fill-content_color'
                    />
                  </div>
                </RowCell>
              </TR>
            ))}
          </TBody>
        </TableLayout>
      )}
    </>
  )
}

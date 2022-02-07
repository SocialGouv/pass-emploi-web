import React, { useCallback, useEffect, useState } from 'react'
import { Jeune } from 'interfaces/jeune'
import Link from 'next/link'
import ChevronRight from '../../assets/icons/chevron_right.svg'
import ArrowDouble from '../../assets/icons/arrow_double.svg'
import ArrowDown from '../../assets/icons/arrow_down.svg'
import {
  dateIsToday,
  dateIsYesterday,
  formatDayDate,
  formatHourMinuteDate,
  isDateOlder,
} from 'utils/date'
import useMatomo from 'utils/analytics/useMatomo'

enum SortColumn {
  NOM = 'NOM',
  DERNIERE_ACTIVITE = 'DERNIERE_ACTIVITE',
}

enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

interface TableauJeunesProps {
  jeunes: Jeune[]
}

function todayOrDate(date: Date): string {
  let dateString = ''

  if (dateIsToday(date)) {
    dateString = "Aujourd'hui"
  } else if (dateIsYesterday(date)) {
    dateString = 'Hier'
  } else {
    dateString = `Le ${formatDayDate(date)}`
  }

  return `${dateString} à ${formatHourMinuteDate(date)}`
}

export const TableauJeunes = ({ jeunes }: TableauJeunesProps) => {
  const [sortedJeunes, setSortedJeunes] = useState<Jeune[]>(jeunes)
  const [currentSortedColumn, setCurrentSortedColumn] = useState<SortColumn>(
    SortColumn.NOM
  )
  const [currentSortedDirection, setCurrentSortedDirection] =
    useState<SortDirection>(SortDirection.ASC)

  const isAsc = currentSortedDirection === SortDirection.ASC
  const isDesc = currentSortedDirection === SortDirection.DESC
  const isName = currentSortedColumn === SortColumn.NOM
  const isDate = currentSortedColumn === SortColumn.DERNIERE_ACTIVITE

  const sortJeunes = (newSortColumn: SortColumn) => {
    if (currentSortedColumn !== newSortColumn) {
      setCurrentSortedColumn(newSortColumn)
      setCurrentSortedDirection(SortDirection.ASC)
    } else {
      if (isAsc) setCurrentSortedDirection(SortDirection.DESC)
      if (isDesc) setCurrentSortedDirection(SortDirection.ASC)
    }
  }

  useEffect(() => {
    function compareJeunes(jeune1: Jeune, jeune2: Jeune) {
      const date1 = jeune1.lastActivity
        ? new Date(jeune1.lastActivity)
        : new Date('1995-12-17T03:24:00')
      const date2 = jeune2.lastActivity
        ? new Date(jeune2.lastActivity)
        : new Date('1995-12-17T03:24:00')

      if (
        (isName && isAsc && jeune1.lastName < jeune2.lastName) ||
        (isName && isDesc && jeune1.lastName > jeune2.lastName) ||
        (isDate && isAsc && isDateOlder(date2, date1)) ||
        (isDate && isDesc && isDateOlder(date1, date2))
      ) {
        return -1
      }
      if (
        (isName && isAsc && jeune1.lastName > jeune2.lastName) ||
        (isName && isDesc && jeune1.lastName < jeune2.lastName) ||
        (isDate && isAsc && isDateOlder(date1, date2)) ||
        (isDate && isDesc && isDateOlder(date2, date1))
      ) {
        return 1
      }

      return 0
    }
    setSortedJeunes([...jeunes.sort(compareJeunes)])
  }, [
    currentSortedColumn,
    currentSortedDirection,
    isAsc,
    isDate,
    isDesc,
    isName,
    jeunes,
  ])

  const matomoTitle = () => {
    if (isDate && isAsc)
      return 'Mes jeunes - Dernière activité - Ordre chronologique'
    if (isDate && isDesc)
      return 'Mes jeunes - Dernière activité - Ordre antéchronologique'
    if (isName && isAsc) return 'Mes jeunes - Nom - Ordre alphabétique'
    if (isName && isDesc) return 'Mes jeunes - Nom - Ordre alphabétique inversé'
  }

  useMatomo(matomoTitle())

  return (
    <>
      {sortedJeunes.length === 0 ? (
        <p className='mt-32 text-base-medium text-center text-bleu_nuit'>
          Aucun jeune trouvé
        </p>
      ) : (
        <div
          role='table'
          className='table w-full'
          aria-describedby='table-caption'
        >
          <div id='table-caption' className='visually-hidden'>
            Liste de mes jeunes
          </div>

          <div role='rowgroup'>
            <div role='row' className='table-row grid grid-cols-table'>
              <span
                role='columnheader'
                className='table-cell text-sm text-bleu text-left p-4'
              >
                <button
                  className='flex hover:bg-gris_blanc p-2 rounded-medium'
                  onClick={() => sortJeunes(SortColumn.NOM)}
                  aria-label={`Afficher la liste des jeunes triée par noms par ordre alphabétique ${
                    isName && isAsc ? 'inversé' : ''
                  }`}
                  title={`Afficher la liste des jeunes triée par noms par ordre alphabétique ${
                    isName && isAsc ? 'inversé' : ''
                  }`}
                >
                  <span className='mr-1'>Nom du jeune</span>
                  {isName ? (
                    <ArrowDown
                      focusable='false'
                      aria-hidden='true'
                      className={isDesc ? 'rotate-180' : ''}
                    />
                  ) : (
                    <ArrowDouble focusable='false' aria-hidden='true' />
                  )}
                </button>
              </span>

              <span
                role='columnheader'
                className='table-cell text-sm text-bleu text-left pb-4 pt-4'
              >
                <button
                  className='flex hover:bg-gris_blanc p-2 rounded-medium'
                  onClick={() => sortJeunes(SortColumn.DERNIERE_ACTIVITE)}
                  aria-label={`Afficher la liste des jeunes triée par dates de dernière activité par ordre ${
                    isDate && isAsc ? 'antéchronologique' : 'chronologique'
                  }`}
                  title={`Afficher la liste des jeunes triée par dates de dernière activité par ordre ${
                    isDate && isAsc ? 'antéchronologique' : 'chronologique'
                  }`}
                >
                  <span className='mr-1'>Dernière activité</span>
                  {isDate ? (
                    <ArrowDown
                      focusable='false'
                      aria-hidden='true'
                      className={isDesc ? 'rotate-180' : ''}
                    />
                  ) : (
                    <ArrowDouble focusable='false' aria-hidden='true' />
                  )}
                </button>
              </span>
            </div>
          </div>

          <div role='rowgroup'>
            {sortedJeunes?.map((jeune: Jeune) => (
              <Link href={`/mes-jeunes/${jeune.id}`} key={jeune.id} passHref>
                <a
                  key={jeune.id}
                  role='row'
                  aria-label={`Accéder à la fiche de ${jeune.firstName} ${jeune.lastName}, dernière activité ${jeune.lastActivity}`}
                  className='table-row grid grid-cols-table text-sm text-bleu_nuit items-center cursor-pointer hover:bg-gris_blanc'
                >
                  <span
                    role='cell'
                    className='table-cell p-4'
                    aria-hidden='true'
                  >
                    {jeune.lastName} {jeune.firstName}
                  </span>

                  <span
                    role='cell'
                    className='table-cell p-4'
                    aria-hidden='true'
                  >
                    {jeune.lastActivity
                      ? todayOrDate(new Date(jeune.lastActivity))
                      : ''}
                  </span>

                  <span
                    role='cell'
                    className='table-cell p-4 col-end-6'
                    aria-hidden='true'
                  >
                    <ChevronRight aria-hidden='true' focusable='false' />
                  </span>
                </a>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

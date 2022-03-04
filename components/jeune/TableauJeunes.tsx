import {
  compareJeunesByLastName,
  compareJeunesByLastNameDesc,
  getJeuneFullname,
  Jeune,
  JeunesAvecMessagesNonLus,
} from 'interfaces/jeune'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import useMatomo from 'utils/analytics/useMatomo'
import {
  compareDates,
  compareDatesDesc,
  dateIsToday,
  dateIsYesterday,
  formatDayDate,
  formatHourMinuteDate,
} from 'utils/date'
import ArrowDouble from '../../assets/icons/arrow_double.svg'
import ArrowDown from '../../assets/icons/arrow_down.svg'
import MessageIcon from '../../assets/icons/note_outline_big.svg'

enum SortColumn {
  NOM = 'NOM',
  DERNIERE_ACTIVITE = 'DERNIERE_ACTIVITE',
  MESSAGES = 'MESSAGES',
}

interface TableauJeunesProps {
  jeunes: JeunesAvecMessagesNonLus
}

function todayOrDate(date: Date): string {
  let dateString: string

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
  const [sortedJeunes, setSortedJeunes] =
    useState<JeunesAvecMessagesNonLus>(jeunes)
  const [currentSortedColumn, setCurrentSortedColumn] = useState<SortColumn>(
    SortColumn.NOM
  )
  const [sortDesc, setSortDesc] = useState<boolean>(false)

  const isName = currentSortedColumn === SortColumn.NOM
  const isDate = currentSortedColumn === SortColumn.DERNIERE_ACTIVITE
  const isMessage = currentSortedColumn === SortColumn.MESSAGES

  const sortJeunes = (newSortColumn: SortColumn) => {
    if (currentSortedColumn !== newSortColumn) {
      setCurrentSortedColumn(newSortColumn)
      setSortDesc(false)
    } else {
      setSortDesc(!sortDesc)
    }
  }

  useEffect(() => {
    function compareJeunes(
      jeune1: Jeune & { messagesNonLus: number },
      jeune2: Jeune & { messagesNonLus: number }
    ) {
      if (isName)
        return sortDesc
          ? compareJeunesByLastNameDesc(jeune1, jeune2)
          : compareJeunesByLastName(jeune1, jeune2)

      if (isDate) {
        const date1 = jeune1.lastActivity
          ? new Date(jeune1.lastActivity)
          : undefined
        const date2 = jeune2.lastActivity
          ? new Date(jeune2.lastActivity)
          : undefined
        return sortDesc
          ? compareDates(date1, date2)
          : compareDatesDesc(date1, date2)
      }

      if (isMessage) {
        return sortDesc
          ? jeune1.messagesNonLus - jeune2.messagesNonLus
          : jeune2.messagesNonLus - jeune1.messagesNonLus
      }

      return 0
    }

    setSortedJeunes([...jeunes].sort(compareJeunes))
  }, [currentSortedColumn, isDate, isName, isMessage, sortDesc, jeunes])

  const matomoTitle = () => {
    if (isDate && !sortDesc)
      return `Mes jeunes - Dernière activité - Ordre chronologique`
    if (isDate && sortDesc)
      return 'Mes jeunes - Dernière activité - Ordre antéchronologique'
    if (isName && !sortDesc) return 'Mes jeunes - Nom - Ordre alphabétique'
    if (isName && sortDesc)
      return 'Mes jeunes - Nom - Ordre alphabétique inversé'
    if (isMessage && sortDesc) return 'Mes jeunes - Messages - Ordre croissant'
    if (isMessage && !sortDesc)
      return 'Mes jeunes - Messages - Ordre décroissant'
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
          <div id='table-caption' className='sr-only'>
            Liste de mes jeunes
          </div>

          <div role='rowgroup'>
            <div role='row' className='table-row grid grid-cols-table'>
              <span
                role='columnheader'
                className='table-cell text-sm text-bleu text-left p-4'
              >
                <button
                  className='flex border-none hover:bg-gris_blanc p-2 rounded-medium'
                  onClick={() => sortJeunes(SortColumn.NOM)}
                  aria-label={`Afficher la liste des jeunes triée par noms de famille par ordre alphabétique ${
                    isName && !sortDesc ? 'inversé' : ''
                  }`}
                  title={`Afficher la liste des jeunes triée par noms de famille par ordre alphabétique ${
                    isName && !sortDesc ? 'inversé' : ''
                  }`}
                >
                  <span className='mr-1'>Nom du jeune</span>
                  {isName && (
                    <ArrowDown
                      focusable='false'
                      aria-hidden='true'
                      className={sortDesc ? 'rotate-180' : ''}
                    />
                  )}
                  {!isName && (
                    <ArrowDouble focusable='false' aria-hidden='true' />
                  )}
                </button>
              </span>
              <span
                role='columnheader'
                className='table-cell text-sm text-bleu text-left pb-4 pt-4'
              >
                <button
                  className='flex border-none hover:bg-gris_blanc p-2 rounded-medium'
                  onClick={() => sortJeunes(SortColumn.DERNIERE_ACTIVITE)}
                  aria-label={`Afficher la liste des jeunes triée par dates de dernière action du jeune par ordre ${
                    isDate && !sortDesc ? 'antéchronologique' : 'chronologique'
                  }`}
                  title={`Afficher la liste des jeunes triée par dates de dernière action du jeune par ordre ${
                    isDate && !sortDesc ? 'antéchronologique' : 'chronologique'
                  }`}
                >
                  <span className='mr-1'>Dernière action du jeune</span>
                  {isDate && (
                    <ArrowDown
                      focusable='false'
                      aria-hidden='true'
                      className={sortDesc ? 'rotate-180' : ''}
                    />
                  )}
                  {!isDate && (
                    <ArrowDouble focusable='false' aria-hidden='true' />
                  )}
                </button>
              </span>
              <span
                role='columnheader'
                className='table-cell text-sm text-bleu text-left pb-4 pt-4'
              >
                <button
                  className='flex border-none hover:bg-gris_blanc p-2 rounded-medium'
                  onClick={() => sortJeunes(SortColumn.MESSAGES)}
                  aria-label={`Afficher la liste des messages non lus par nombre ${
                    isMessage && !sortDesc ? 'croissant' : 'décroissant'
                  }`}
                  title={`Afficher la liste des messages non lus par nombre ${
                    isMessage && !sortDesc ? 'croissant' : 'décroissant'
                  }`}
                >
                  <span className='mr-1'>Messages</span>
                  {isMessage && (
                    <ArrowDown
                      focusable='false'
                      aria-hidden='true'
                      className={sortDesc ? 'rotate-180' : ''}
                    />
                  )}
                  {!isMessage && (
                    <ArrowDouble focusable='false' aria-hidden='true' />
                  )}
                </button>
              </span>
            </div>
          </div>

          <div role='rowgroup'>
            {sortedJeunes?.map((jeune) => (
              <Link href={`/mes-jeunes/${jeune.id}`} key={jeune.id}>
                <a
                  key={jeune.id}
                  role='row'
                  aria-label={`Accéder à la fiche de ${jeune.firstName} ${jeune.lastName}, dernière activité ${jeune.lastActivity}, ${jeune.messagesNonLus} messages non lus`}
                  className='table-row grid grid-cols-table text-sm text-bleu_nuit items-center cursor-pointer hover:bg-gris_blanc'
                >
                  <span role='cell' className='table-cell p-4'>
                    {getJeuneFullname(jeune)}
                  </span>

                  <span role='cell' className='table-cell p-4'>
                    {jeune.lastActivity
                      ? todayOrDate(new Date(jeune.lastActivity))
                      : ''}
                  </span>
                  <span role='cell' className='table-cell p-4'>
                    <div className='relative'>
                      <MessageIcon aria-hidden='true' focusable='false' />
                      {jeune.messagesNonLus > 0 && (
                        <div className='absolute top-[-10px] left-[10px] w-4 h-4 flex justify-center items-center bg-warning rounded-full text-center p-2.5 text-blanc text-xs-medium'>
                          {jeune.messagesNonLus}
                        </div>
                      )}
                    </div>
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

import {
  compareJeuneByLastActivity,
  compareJeuneByLastActivityDesc,
  compareJeunesByLastName,
  compareJeunesByLastNameDesc,
  getJeuneFullname,
  JeuneAvecInfosComplementaires,
} from 'interfaces/jeune'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import useMatomo from 'utils/analytics/useMatomo'
import {
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
  NB_ACTIONS_NON_TERMINEES = 'NB_ACTIONS_NON_TERMINEES',
  MESSAGES = 'MESSAGES',
}

interface TableauJeunesProps {
  jeunes: JeuneAvecInfosComplementaires[]
  withActions: boolean
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

export const TableauJeunes = ({ jeunes, withActions }: TableauJeunesProps) => {
  const [sortedJeunes, setSortedJeunes] =
    useState<JeuneAvecInfosComplementaires[]>(jeunes)
  const [currentSortedColumn, setCurrentSortedColumn] = useState<SortColumn>(
    SortColumn.NOM
  )
  const [sortDesc, setSortDesc] = useState<boolean>(false)

  const isName = currentSortedColumn === SortColumn.NOM
  const isDate = currentSortedColumn === SortColumn.DERNIERE_ACTIVITE
  const isAction = currentSortedColumn === SortColumn.NB_ACTIONS_NON_TERMINEES
  const isMessage = currentSortedColumn === SortColumn.MESSAGES

  const gridColsStyle = withActions
    ? 'grid-cols-[repeat(4,1fr)]'
    : 'grid-cols-[repeat(3,1fr)]'

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
      jeune1: JeuneAvecInfosComplementaires,
      jeune2: JeuneAvecInfosComplementaires
    ) {
      if (isName)
        return sortDesc
          ? compareJeunesByLastNameDesc(jeune1, jeune2)
          : compareJeunesByLastName(jeune1, jeune2)

      if (isDate) {
        const sortStatutCompteActif =
          Number(jeune1.isActivated) - Number(jeune2.isActivated)

        return sortDesc
          ? compareJeuneByLastActivity(jeune1, jeune2, sortStatutCompteActif)
          : compareJeuneByLastActivityDesc(
              jeune1,
              jeune2,
              sortStatutCompteActif
            )
      }

      if (isMessage) {
        const sortMessagesNonLus = jeune1.messagesNonLus - jeune2.messagesNonLus
        return sortDesc ? sortMessagesNonLus : -sortMessagesNonLus
      }

      if (isAction) {
        const sortNbActionsNonTerminees =
          jeune1.nbActionsNonTerminees - jeune2.nbActionsNonTerminees
        return sortDesc ? sortNbActionsNonTerminees : -sortNbActionsNonTerminees
      }

      return 0
    }

    setSortedJeunes([...jeunes].sort(compareJeunes))
  }, [
    currentSortedColumn,
    isDate,
    isName,
    isMessage,
    sortDesc,
    jeunes,
    isAction,
  ])

  const matomoTitle = () => {
    if (isDate && !sortDesc)
      return `Mes jeunes - Dernière activité - Ordre chronologique`
    if (isDate && sortDesc)
      return 'Mes jeunes - Dernière activité - Ordre antéchronologique'
    if (isName && !sortDesc) return 'Mes jeunes - Nom - Ordre alphabétique'
    if (isName && sortDesc)
      return 'Mes jeunes - Nom - Ordre alphabétique inversé'
    if (isAction && sortDesc) return 'Mes jeunes - Actions - Ordre croissant'
    if (isAction && !sortDesc) return 'Mes jeunes - Actions - Ordre décroissant'
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
            <div role='row' className={`table-row grid ${gridColsStyle}`}>
              <span
                role='columnheader'
                className='table-cell text-sm text-bleu text-left py-4'
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
                className='table-cell text-sm text-bleu text-left py-4'
              >
                <button
                  className='flex border-none hover:bg-gris_blanc p-2 rounded-medium'
                  onClick={() => sortJeunes(SortColumn.DERNIERE_ACTIVITE)}
                  aria-label={`Afficher la liste des jeunes triée par dates de dernière activité du jeune par ordre ${
                    isDate && !sortDesc ? 'antéchronologique' : 'chronologique'
                  }`}
                  title={`Afficher la liste des jeunes triée par dates de dernière activité du jeune par ordre ${
                    isDate && !sortDesc ? 'antéchronologique' : 'chronologique'
                  }`}
                >
                  <span className='mr-1'>Dernière activité du jeune</span>
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

              {withActions && (
                <span
                  role='columnheader'
                  className='table-cell text-sm text-bleu text-left py-4'
                >
                  <button
                    className='flex border-none hover:bg-gris_blanc p-2 rounded-medium items-center mx-auto'
                    onClick={() =>
                      sortJeunes(SortColumn.NB_ACTIONS_NON_TERMINEES)
                    }
                    aria-label={`Afficher la liste des jeunes triée par nombre d'actions non terminées du jeune par ordre ${
                      isAction && !sortDesc ? 'croissant' : 'décroissant'
                    }`}
                    title={`Afficher la liste des jeunes triée par nombre d'actions non terminées du jeune par ordre ${
                      isAction && !sortDesc ? 'croissant' : 'décroissant'
                    }`}
                  >
                    <span className='mr-1'>Actions</span>
                    {isAction && (
                      <ArrowDown
                        focusable='false'
                        aria-hidden='true'
                        className={sortDesc ? 'rotate-180' : ''}
                      />
                    )}
                    {!isAction && (
                      <ArrowDouble focusable='false' aria-hidden='true' />
                    )}
                  </button>
                </span>
              )}

              <span
                role='columnheader'
                className='table-cell text-sm text-bleu text-left py-4'
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
            {sortedJeunes?.map((jeune: JeuneAvecInfosComplementaires) => (
              <Link href={`/mes-jeunes/${jeune.id}`} key={jeune.id}>
                <a
                  role='row'
                  aria-label={`Accéder à la fiche de ${jeune.firstName} ${jeune.lastName}, dernière activité ${jeune.lastActivity}, ${jeune.messagesNonLus} messages non lus`}
                  className={`table-row grid ${gridColsStyle} text-sm text-bleu_nuit items-center hover:bg-gris_blanc`}
                >
                  <span role='cell' className='table-cell p-4'>
                    {getJeuneFullname(jeune)}
                  </span>

                  <span role='cell' className='table-cell p-4'>
                    {jeune.lastActivity
                      ? todayOrDate(new Date(jeune.lastActivity))
                      : ''}
                    {!jeune.isActivated && (
                      <span className='text-warning'>Compte non activé</span>
                    )}
                  </span>

                  {withActions && (
                    <span
                      role='cell'
                      className='table-cell text-primary_darken p-4 items-center mx-auto'
                    >
                      <span className='w-5 h-5 flex justify-center items-center bg-primary_lighten rounded-full text-center p-3.5'>
                        {jeune.nbActionsNonTerminees}
                      </span>
                    </span>
                  )}
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

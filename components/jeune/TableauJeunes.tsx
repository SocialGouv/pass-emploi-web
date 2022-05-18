import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import ArrowDouble from '../../assets/icons/arrow_double.svg'
import ArrowDown from '../../assets/icons/arrow_down.svg'
import MessageIcon from '../../assets/icons/note_outline_big.svg'

import { Badge } from 'components/ui/Badge'
import SituationTag from 'components/jeune/SituationTag'
import {
  compareJeuneByLastActivity,
  compareJeuneByLastActivityDesc,
  compareJeunesByLastName,
  compareJeunesByLastNameDesc,
  compareJeunesBySituation,
  compareJeunesBySituationDesc,
  getJeuneFullname,
  JeuneAvecInfosComplementaires,
} from 'interfaces/jeune'
import useMatomo from 'utils/analytics/useMatomo'
import {
  dateIsToday,
  dateIsYesterday,
  formatDayDate,
  formatHourMinuteDate,
} from 'utils/date'

enum SortColumn {
  NOM = 'NOM',
  SITUATION = 'SITUATION',
  DERNIERE_ACTIVITE = 'DERNIERE_ACTIVITE',
  NB_ACTIONS_NON_TERMINEES = 'NB_ACTIONS_NON_TERMINEES',
  MESSAGES = 'MESSAGES',
}

interface TableauJeunesProps {
  jeunes: JeuneAvecInfosComplementaires[]
  withActions: boolean
  withSituations: boolean
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

export const TableauJeunes = ({
  jeunes,
  withActions,
  withSituations,
}: TableauJeunesProps) => {
  const [sortedJeunes, setSortedJeunes] =
    useState<JeuneAvecInfosComplementaires[]>(jeunes)
  const [currentSortedColumn, setCurrentSortedColumn] = useState<SortColumn>(
    SortColumn.NOM
  )
  const [sortDesc, setSortDesc] = useState<boolean>(false)

  const isName = currentSortedColumn === SortColumn.NOM
  const isSituation = currentSortedColumn === SortColumn.SITUATION
  const isDate = currentSortedColumn === SortColumn.DERNIERE_ACTIVITE
  const isAction = currentSortedColumn === SortColumn.NB_ACTIONS_NON_TERMINEES
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
      jeune1: JeuneAvecInfosComplementaires,
      jeune2: JeuneAvecInfosComplementaires
    ) {
      if (isName)
        return sortDesc
          ? compareJeunesByLastNameDesc(jeune1, jeune2)
          : compareJeunesByLastName(jeune1, jeune2)

      if (isSituation)
        return sortDesc
          ? compareJeunesBySituationDesc(jeune1, jeune2)
          : compareJeunesBySituation(jeune1, jeune2)

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
    isSituation,
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
    if (isSituation && !sortDesc)
      return 'Mes jeunes - Situation - Ordre alphabétique'
    if (isSituation && sortDesc)
      return 'Mes jeunes - Situation - Ordre alphabétique inversé'
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
        <p className='mt-32 text-base-medium text-center text-primary'>
          Aucun jeune trouvé
        </p>
      ) : (
        <div
          role='table'
          className='table table-fixed w-full'
          aria-describedby='table-caption'
        >
          <div id='table-caption' className='sr-only'>
            Liste de mes jeunes
          </div>

          <div role='rowgroup' className='table-row-group'>
            <div role='row' className={`table-row`}>
              <span
                role='columnheader'
                className='table-cell text-sm text-left py-4'
              >
                <button
                  className='flex border-none hover:bg-primary_lighten p-2 rounded-medium items-center'
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
              {withSituations && (
                <span
                  role='columnheader'
                  className='table-cell text-sm text-left p-4'
                >
                  <button
                    className='flex border-none hover:bg-primary_lighten p-2 rounded-medium items-center'
                    onClick={() => sortJeunes(SortColumn.SITUATION)}
                    aria-label={`Afficher la liste des jeunes triée par situation par ordre alphabétique ${
                      isSituation && !sortDesc ? 'inversé' : ''
                    }`}
                    title={`Afficher la liste des jeunes triée par situation par ordre alphabétique ${
                      isSituation && !sortDesc ? 'inversé' : ''
                    }`}
                  >
                    <span className='mr-1'>Situation</span>
                    {isSituation && (
                      <ArrowDown
                        focusable='false'
                        aria-hidden='true'
                        className={sortDesc ? 'rotate-180' : ''}
                      />
                    )}
                    {!isSituation && (
                      <ArrowDouble focusable='false' aria-hidden='true' />
                    )}
                  </button>
                </span>
              )}
              <span
                role='columnheader'
                className='table-cell text-sm text-left py-4'
              >
                <button
                  className='flex border-none hover:bg-primary_lighten p-2 rounded-medium items-center'
                  onClick={() => sortJeunes(SortColumn.DERNIERE_ACTIVITE)}
                  aria-label={`Afficher la liste des jeunes triée par dates de dernière activité du jeune par ordre ${
                    isDate && !sortDesc ? 'chronologique' : 'antéchronologique'
                  }`}
                  title={`Afficher la liste des jeunes triée par dates de dernière activité du jeune par ordre ${
                    isDate && !sortDesc ? 'chronologique' : 'antéchronologique'
                  }`}
                >
                  <span className='mr-1'>
                    Dernière activité
                    <br />
                    du jeune
                  </span>
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
                  className='table-cell text-sm  text-left py-4'
                >
                  <button
                    className='flex border-none hover:bg-primary_lighten p-2 rounded-medium items-center mx-auto'
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
                className='table-cell text-sm  text-left py-4'
              >
                <button
                  className='flex border-none hover:bg-primary_lighten p-2 rounded-medium items-center mx-auto'
                  onClick={() => sortJeunes(SortColumn.MESSAGES)}
                  aria-label={`Afficher la liste des messages non lus par nombre ${
                    isMessage && !sortDesc ? 'croissant' : 'décroissant'
                  }`}
                  title={`Afficher la liste des messages non lus par nombre ${
                    isMessage && !sortDesc ? 'croissant' : 'décroissant'
                  }`}
                >
                  <span className='mr-1'>
                    Messages non lus
                    <br /> par le jeune
                  </span>
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

          <div role='rowgroup' className='table-row-group'>
            {sortedJeunes?.map((jeune: JeuneAvecInfosComplementaires) => (
              <Link href={`/mes-jeunes/${jeune.id}`} key={jeune.id}>
                <a
                  role='row'
                  aria-label={`Accéder à la fiche de ${jeune.firstName} ${jeune.lastName}, dernière activité ${jeune.lastActivity}, ${jeune.messagesNonLus} messages non lus`}
                  className={`table-row text-sm  items-center hover:bg-primary_lighten`}
                >
                  <span role='cell' className='table-cell p-4'>
                    {getJeuneFullname(jeune)}
                  </span>

                  {withSituations && (
                    <span role='cell' className='table-cell p-4'>
                      <SituationTag
                        situation={jeune.situationCourante}
                      ></SituationTag>
                    </span>
                  )}

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
                      className='table-cell text-primary_darken p-4'
                    >
                      <div className='mx-auto w-fit'>
                        <Badge count={jeune.nbActionsNonTerminees} />
                      </div>
                    </span>
                  )}
                  <span role='cell' className='table-cell p-4'>
                    <div className='relative w-fit mx-auto'>
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

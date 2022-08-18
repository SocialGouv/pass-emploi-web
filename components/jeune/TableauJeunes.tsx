import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import CellRow from '../ui/Table/CellRow'

import SituationTag from 'components/jeune/SituationTag'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Badge } from 'components/ui/Indicateurs/Badge'
import SortIcon from 'components/ui/SortIcon'
import { HeaderColumnCell } from 'components/ui/Table/HeaderColumnCell'
import {
  compareJeuneByLastActivity,
  compareJeuneByLastActivityDesc,
  compareJeunesByLastNameDesc,
  compareJeunesByNom,
  compareJeunesBySituation,
  compareJeunesBySituationDesc,
  getNomJeuneComplet,
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

export default function TableauJeunes({
  jeunes,
  withActions,
  withSituations,
}: TableauJeunesProps) {
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
          : compareJeunesByNom(jeune1, jeune2)

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

  const columnHeaderButtonStyle = 'flex border-none items-center'
  const columnHeaderButtonStyleHover = 'rounded-medium hover:bg-primary_lighten'

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
        <p className='mt-32 text-base-bold text-center text-primary'>
          Aucun jeune trouvé
        </p>
      ) : (
        <div
          role='table'
          className='table w-full border-spacing-y-3 border-separate'
          aria-describedby='table-caption'
        >
          <div id='table-caption' className='sr-only'>
            Liste de mes bénéficiaires
          </div>

          <div role='rowgroup' className='table-row-group'>
            <div role='row' className={`table-row`}>
              <HeaderColumnCell className={columnHeaderButtonStyleHover}>
                <button
                  className={columnHeaderButtonStyle}
                  onClick={() => sortJeunes(SortColumn.NOM)}
                  aria-label={`Afficher la liste des bénéficiaires triée par noms de famille par ordre alphabétique ${
                    isName && !sortDesc ? 'inversé' : ''
                  }`}
                  title={`Afficher la liste des bénéficiaires triée par noms de famille par ordre alphabétique ${
                    isName && !sortDesc ? 'inversé' : ''
                  }`}
                >
                  <span className='mr-1'>Bénéficiaire</span>
                  <SortIcon isSorted={isName} isDesc={sortDesc} />
                </button>
              </HeaderColumnCell>
              {withSituations && (
                <HeaderColumnCell className={columnHeaderButtonStyleHover}>
                  <button
                    className={columnHeaderButtonStyle}
                    onClick={() => sortJeunes(SortColumn.SITUATION)}
                    aria-label={`Afficher la liste des bénéficiaires triée par situation par ordre alphabétique ${
                      isSituation && !sortDesc ? 'inversé' : ''
                    }`}
                    title={`Afficher la liste des bénéficiaires triée par situation par ordre alphabétique ${
                      isSituation && !sortDesc ? 'inversé' : ''
                    }`}
                  >
                    <span className='mr-1'>Situation</span>
                    <SortIcon isSorted={isSituation} isDesc={sortDesc} />
                  </button>
                </HeaderColumnCell>
              )}
              <HeaderColumnCell className={columnHeaderButtonStyleHover}>
                <button
                  className={columnHeaderButtonStyle}
                  onClick={() => sortJeunes(SortColumn.DERNIERE_ACTIVITE)}
                  aria-label={`Afficher la liste des bénéficiaires triée par dates de dernière activité du bénéficiaire par ordre ${
                    isDate && !sortDesc ? 'chronologique' : 'antéchronologique'
                  }`}
                  title={`Afficher la liste des bénéficiaires triée par dates de dernière activité du bénéficiaire par ordre ${
                    isDate && !sortDesc ? 'chronologique' : 'antéchronologique'
                  }`}
                >
                  <span className='mr-1'>D. activité</span>
                  <SortIcon isSorted={isDate} isDesc={sortDesc} />
                </button>
              </HeaderColumnCell>

              {withActions && (
                <HeaderColumnCell className={columnHeaderButtonStyleHover}>
                  <button
                    className={`${columnHeaderButtonStyle} mx-auto`}
                    onClick={() =>
                      sortJeunes(SortColumn.NB_ACTIONS_NON_TERMINEES)
                    }
                    aria-label={`Afficher la liste des bénéficiaires triée par nombre d'actions non terminées du jeune par ordre ${
                      isAction && !sortDesc ? 'croissant' : 'décroissant'
                    }`}
                    title={`Afficher la liste des bénéficiaires triée par nombre d'actions non terminées du jeune par ordre ${
                      isAction && !sortDesc ? 'croissant' : 'décroissant'
                    }`}
                  >
                    <span className='mr-1'>Actions</span>
                    <SortIcon isSorted={isAction} isDesc={sortDesc} />
                  </button>
                </HeaderColumnCell>
              )}

              <HeaderColumnCell className={columnHeaderButtonStyleHover}>
                <button
                  className={`${columnHeaderButtonStyle} mx-auto`}
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
                    <br /> par le bénéficiaire
                  </span>
                  <SortIcon isSorted={isMessage} isDesc={sortDesc} />
                </button>
              </HeaderColumnCell>
            </div>
          </div>

          <div role='rowgroup' className='table-row-group'>
            {sortedJeunes?.map((jeune: JeuneAvecInfosComplementaires) => (
              <Link href={`/mes-jeunes/${jeune.id}`} key={jeune.id}>
                <a
                  role='row'
                  aria-label={`Accéder à la fiche de ${jeune.prenom} ${jeune.nom}, dernière activité ${jeune.lastActivity}, ${jeune.messagesNonLus} messages non lus`}
                  className='table-row text-base-regular rounded-small shadow-s hover:bg-primary_lighten'
                >
                  <CellRow className='rounded-l-small'>
                    <span className='flex items-baseline'>
                      {jeune.isReaffectationTemporaire && (
                        <span
                          title='bénéficiaire temporaire'
                          aria-label='bénéficiaire temporaire'
                          className='self-center mr-2'
                        >
                          <IconComponent
                            name={IconName.Clock}
                            aria-hidden={true}
                            focusable={false}
                            className='w-4 h-4'
                          />
                        </span>
                      )}
                      {getNomJeuneComplet(jeune)}
                    </span>
                  </CellRow>

                  {withSituations && (
                    <CellRow>
                      <SituationTag
                        className={
                          'max-w-[100px] layout_l:max-w-[180px] truncate text-ellipsis'
                        }
                        situation={jeune.situationCourante}
                      />
                    </CellRow>
                  )}

                  <CellRow>
                    {jeune.lastActivity
                      ? todayOrDate(new Date(jeune.lastActivity))
                      : ''}
                    {!jeune.isActivated && (
                      <span className='text-warning'>Compte non activé</span>
                    )}
                  </CellRow>

                  {withActions && (
                    <CellRow className='text-primary_darken'>
                      <div className='mx-auto w-fit'>
                        <Badge
                          count={jeune.nbActionsNonTerminees}
                          bgColor='primary'
                        />
                      </div>
                    </CellRow>
                  )}
                  <CellRow className='rounded-r-small'>
                    <span className='flex'>
                      <div className='relative w-fit mx-auto'>
                        <IconComponent
                          name={IconName.NoteBig}
                          aria-hidden='true'
                          focusable='false'
                          className='w-6 h-6 fill-primary'
                        />
                        {jeune.messagesNonLus > 0 && (
                          <div className='absolute top-[-10px] left-[10px] w-4 h-4 flex justify-center items-center bg-warning rounded-full text-center p-2.5 text-blanc text-xs-medium'>
                            {jeune.messagesNonLus}
                          </div>
                        )}
                      </div>
                      <IconComponent
                        name={IconName.ChevronRight}
                        focusable='false'
                        aria-hidden='true'
                        className='w-6 h-6 fill-content_color'
                      />
                    </span>
                  </CellRow>
                </a>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

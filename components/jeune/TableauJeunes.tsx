import React, { useEffect, useState } from 'react'

import EmptyState from 'components/EmptyState'
import SituationTag from 'components/jeune/SituationTag'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import { Badge } from 'components/ui/Indicateurs/Badge'
import SortIcon from 'components/ui/SortIcon'
import Pagination from 'components/ui/Table/Pagination'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import TR from 'components/ui/Table/TR'
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
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toRelativeDateTime } from 'utils/date'

enum SortColumn {
  NOM = 'NOM',
  SITUATION = 'SITUATION',
  DERNIERE_ACTIVITE = 'DERNIERE_ACTIVITE',
  NB_ACTIONS_NON_TERMINEES = 'NB_ACTIONS_NON_TERMINEES',
  MESSAGES = 'MESSAGES',
}

interface TableauJeunesProps {
  jeunesFiltres: JeuneAvecInfosComplementaires[]
  totalJeunes: number
  withActions: boolean
  withSituations: boolean
}

export default function TableauJeunes({
  jeunesFiltres,
  totalJeunes,
  withActions,
  withSituations,
}: TableauJeunesProps) {
  const [conseiller] = useConseiller()
  const [sortedJeunes, setSortedJeunes] =
    useState<JeuneAvecInfosComplementaires[]>(jeunesFiltres)
  const [currentSortedColumn, setCurrentSortedColumn] = useState<SortColumn>(
    SortColumn.NOM
  )
  const [sortDesc, setSortDesc] = useState<boolean>(false)

  const nombrePagesJeunes = Math.ceil(sortedJeunes.length / 10)
  const [pageJeunes, setPageJeunes] = useState<number>(1)
  const [jeunesAffiches, setJeunesAffiches] = useState<
    JeuneAvecInfosComplementaires[]
  >([])

  const isName = currentSortedColumn === SortColumn.NOM
  const isSituation = currentSortedColumn === SortColumn.SITUATION
  const isDate = currentSortedColumn === SortColumn.DERNIERE_ACTIVITE
  const isAction = currentSortedColumn === SortColumn.NB_ACTIONS_NON_TERMINEES
  const isMessage = currentSortedColumn === SortColumn.MESSAGES

  function sortJeunes(newSortColumn: SortColumn) {
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

    setSortedJeunes([...jeunesFiltres].sort(compareJeunes))
  }, [
    currentSortedColumn,
    isDate,
    isName,
    isSituation,
    isMessage,
    sortDesc,
    jeunesFiltres,
    isAction,
  ])

  useEffect(() => {
    setPageJeunes(1)
  }, [sortedJeunes])

  useEffect(() => {
    setJeunesAffiches(
      sortedJeunes.slice(10 * (pageJeunes - 1), 10 * pageJeunes)
    )
  }, [sortedJeunes, pageJeunes])

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

  const columnHeaderButtonStyle =
    'flex border-none items-center align-top w-full h-full p-4'

  function getRowLabel(jeune: JeuneAvecInfosComplementaires) {
    const labelFiche = `Accéder à la fiche de ${jeune.prenom} ${jeune.nom}`
    const labelActivite = jeune.isActivated
      ? `dernière activité ${toRelativeDateTime(jeune.lastActivity!)}`
      : 'non activé'
    const labelMessages = `${jeune.messagesNonLus} messages non lus`

    return `${labelFiche}, ${labelActivite}, ${labelMessages}`
  }

  return (
    <>
      {sortedJeunes.length === 0 && (
        <>
          <EmptyState
            illustrationName={IllustrationName.People}
            titre='Aucun bénéficiaire trouvé.'
            sousTitre='Recommencez ou modifiez votre recherche.'
          />
        </>
      )}

      {sortedJeunes.length > 0 && (
        <>
          <Table
            asDiv={true}
            caption={{
              text: 'Liste des bénéficiaires',
              count:
                totalJeunes === jeunesFiltres.length ? totalJeunes : undefined,
              visible: true,
            }}
          >
            <THead>
              <TR isHeader={true}>
                <TH estCliquable={true}>
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
                </TH>
                {withSituations && (
                  <TH estCliquable={true}>
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
                  </TH>
                )}
                <TH estCliquable={true}>
                  <button
                    className={columnHeaderButtonStyle}
                    onClick={() => sortJeunes(SortColumn.DERNIERE_ACTIVITE)}
                    aria-label={`Afficher la liste des bénéficiaires triée par dates de dernière activité du bénéficiaire par ordre ${
                      isDate && !sortDesc
                        ? 'chronologique'
                        : 'antéchronologique'
                    }`}
                    title={`Afficher la liste des bénéficiaires triée par dates de dernière activité du bénéficiaire par ordre ${
                      isDate && !sortDesc
                        ? 'chronologique'
                        : 'antéchronologique'
                    }`}
                  >
                    <span className='mr-1'>Dernière activité</span>
                    <SortIcon isSorted={isDate} isDesc={sortDesc} />
                  </button>
                </TH>

                {withActions && (
                  <TH estCliquable={true}>
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
                  </TH>
                )}

                <TH estCliquable={true}>
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
                      Messages non lus par les bénéficiaires
                    </span>
                    <SortIcon isSorted={isMessage} isDesc={sortDesc} />
                  </button>
                </TH>
                <TH>Voir le détail</TH>
              </TR>
            </THead>

            <TBody>
              {jeunesAffiches.map((jeune: JeuneAvecInfosComplementaires) => (
                <TR
                  key={jeune.id}
                  href={`/mes-jeunes/${jeune.id}`}
                  linkLabel={getRowLabel(jeune)}
                >
                  <TD isBold className='rounded-l-base'>
                    <span className='flex items-baseline'>
                      {jeune.structureMilo?.id ===
                        conseiller.structureMilo?.id &&
                        jeune.isReaffectationTemporaire && (
                          <span
                            aria-label='bénéficiaire temporaire'
                            className='self-center mr-2'
                          >
                            <IconComponent
                              name={IconName.Schedule}
                              aria-hidden={true}
                              focusable={false}
                              className='w-4 h-4'
                              title='bénéficiaire temporaire'
                            />
                          </span>
                        )}
                      {jeune.structureMilo?.id !==
                        conseiller.structureMilo?.id && (
                        <span
                          className='self-center mr-2'
                          aria-label='Ce bénéficiaire est rattaché à une Mission Locale différente de la vôtre.'
                        >
                          <IconComponent
                            name={IconName.Error}
                            aria-hidden={true}
                            focusable={false}
                            className='w-4 h-4 fill-warning'
                            title='Ce bénéficiaire est rattaché à une Mission Locale différente de la vôtre.'
                          />
                        </span>
                      )}
                      {getNomJeuneComplet(jeune)}
                    </span>
                  </TD>

                  {withSituations && (
                    <TD>
                      <SituationTag
                        className={
                          'max-w-[100px] layout_l:max-w-[180px] truncate text-ellipsis'
                        }
                        situation={jeune.situationCourante}
                      />
                    </TD>
                  )}

                  <TD>
                    {jeune.isActivated &&
                      toRelativeDateTime(jeune.lastActivity!)}
                    {!jeune.isActivated && (
                      <span className='text-warning'>Compte non activé</span>
                    )}
                  </TD>

                  {withActions && (
                    <TD className='text-primary_darken'>
                      <div className='mx-auto w-fit'>
                        <Badge
                          count={jeune.nbActionsNonTerminees}
                          size={6}
                          textColor={'blanc'}
                          bgColor={'primary'}
                        />
                      </div>
                    </TD>
                  )}

                  <TD className='rounded-r-base'>
                    <div className='flex relative w-fit mx-auto'>
                      <IconComponent
                        name={IconName.Note}
                        aria-hidden={true}
                        focusable={false}
                        className='w-6 h-6 fill-primary'
                      />
                      {jeune.messagesNonLus > 0 && (
                        <Badge
                          count={jeune.messagesNonLus}
                          size={4}
                          bgColor={'accent_1_lighten'}
                          textColor={'accent_1'}
                          style={
                            'absolute top-[-10px] left-[10px] flex justify-center items-center p-2.5 text-xs-medium'
                          }
                        />
                      )}
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>

          {nombrePagesJeunes > 1 && (
            <Pagination
              pageCourante={pageJeunes}
              nombreDePages={nombrePagesJeunes}
              allerALaPage={setPageJeunes}
            />
          )}
        </>
      )}
    </>
  )
}

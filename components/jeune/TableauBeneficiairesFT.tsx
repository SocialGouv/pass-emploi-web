import React, { useEffect, useState } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Badge } from 'components/ui/Indicateurs/Badge'
import SortIcon from 'components/ui/SortIcon'
import TD from 'components/ui/Table/TD'
import TDLink from 'components/ui/Table/TDLink'
import { TH } from 'components/ui/Table/TH'
import TR from 'components/ui/Table/TR'
import {
  BeneficiaireAvecInfosComplementaires,
  compareBeneficiairesByLastActivity,
  compareBeneficiairesByLastActivityDesc,
  compareBeneficiairesByLastNameDesc,
  compareBeneficiairesByNom,
  compareBeneficiairesBySituation,
  compareBeneficiairesBySituationDesc,
  getNomBeneficiaireComplet,
} from 'interfaces/beneficiaire'
import { utiliseChat } from 'interfaces/conseiller'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toRelativeDateTime } from 'utils/date'

enum SortColumn {
  NOM = 'NOM',
  SITUATION = 'SITUATION',
  DERNIERE_ACTIVITE = 'DERNIERE_ACTIVITE',
  MESSAGES = 'MESSAGES',
}

interface TableauBeneficiairesFTProps {
  beneficiairesFiltres: BeneficiaireAvecInfosComplementaires[]
  page: number
  total: number
}

export default function TableauBeneficiairesFT({
  beneficiairesFiltres,
  page,
  total,
}: TableauBeneficiairesFTProps) {
  const [conseiller] = useConseiller()
  const [beneficiairesTries, setBeneficiairesTries] =
    useState<BeneficiaireAvecInfosComplementaires[]>(beneficiairesFiltres)
  const [currentSortedColumn, setCurrentSortedColumn] = useState<SortColumn>(
    SortColumn.NOM
  )
  const [sortDesc, setSortDesc] = useState<boolean>(false)

  const [beneficiairesAffiches, setBeneficiairesAffiches] = useState<
    BeneficiaireAvecInfosComplementaires[]
  >([])

  const isName = currentSortedColumn === SortColumn.NOM
  const isDate = currentSortedColumn === SortColumn.DERNIERE_ACTIVITE
  const isMessage = currentSortedColumn === SortColumn.MESSAGES

  function trierBeneficiaires(newSortColumn: SortColumn) {
    if (currentSortedColumn !== newSortColumn) {
      setCurrentSortedColumn(newSortColumn)
      setSortDesc(false)
    } else {
      setSortDesc(!sortDesc)
    }
  }

  useEffect(() => {
    function compareBeneficiaires(
      jeune1: BeneficiaireAvecInfosComplementaires,
      jeune2: BeneficiaireAvecInfosComplementaires
    ): number {
      switch (currentSortedColumn) {
        case SortColumn.NOM:
          return sortDesc
            ? compareBeneficiairesByLastNameDesc(jeune1, jeune2)
            : compareBeneficiairesByNom(jeune1, jeune2)
        case SortColumn.SITUATION:
          return sortDesc
            ? compareBeneficiairesBySituationDesc(jeune1, jeune2)
            : compareBeneficiairesBySituation(jeune1, jeune2)
        case SortColumn.DERNIERE_ACTIVITE:
          const sortStatutCompteActif =
            Number(jeune1.isActivated) - Number(jeune2.isActivated)

          return sortDesc
            ? compareBeneficiairesByLastActivity(
                jeune1,
                jeune2,
                sortStatutCompteActif
              )
            : compareBeneficiairesByLastActivityDesc(
                jeune1,
                jeune2,
                sortStatutCompteActif
              )
        case SortColumn.MESSAGES:
          const sortMessagesNonLus =
            jeune1.messagesNonLus - jeune2.messagesNonLus
          return sortDesc ? sortMessagesNonLus : -sortMessagesNonLus
      }
    }

    setBeneficiairesTries([...beneficiairesFiltres].sort(compareBeneficiaires))
  }, [currentSortedColumn, sortDesc, beneficiairesFiltres])

  useEffect(() => {
    setBeneficiairesAffiches(
      beneficiairesTries.slice(10 * (page - 1), 10 * page)
    )
  }, [beneficiairesTries, page])

  const matomoTitle = (): string => {
    const prefix = 'Mes jeunes'
    let colonne, ordre: string
    switch (currentSortedColumn) {
      case SortColumn.NOM:
        colonne = 'Nom'
        ordre = sortDesc ? 'alphabétique inversé' : 'alphabétique'
        break
      case SortColumn.SITUATION:
        colonne = 'Situation'
        ordre = sortDesc ? 'alphabétique inversé' : 'alphabétique'
        break
      case SortColumn.DERNIERE_ACTIVITE:
        colonne = 'Dernière activité'
        ordre = sortDesc ? 'antéchronologique' : 'chronologique'
        break
      case SortColumn.MESSAGES:
        colonne = 'Messages'
        ordre = sortDesc ? 'croissant' : 'décroissant'
        break
    }

    return `${prefix} - ${colonne} - Ordre ${ordre}`
  }

  useMatomo(matomoTitle(), total > 0)

  const columnHeaderButtonStyle =
    'flex border-none items-center align-top w-full h-full p-4'

  function getRowLabel(jeune: BeneficiaireAvecInfosComplementaires) {
    const labelFiche = `Accéder à la fiche de ${jeune.prenom} ${jeune.nom}`
    const labelActivite = jeune.isActivated
      ? `dernière activité ${toRelativeDateTime(jeune.lastActivity!)}`
      : 'non activé'
    const labelMessages = `${jeune.messagesNonLus} messages non lus`

    return `${labelFiche}, ${labelActivite}, ${labelMessages}`
  }

  return (
    <>
      <thead>
        <TR isHeader={true}>
          <TH estCliquable={true}>
            <button
              className={columnHeaderButtonStyle}
              onClick={() => trierBeneficiaires(SortColumn.NOM)}
              aria-label={`Afficher la liste des bénéficiaires triée par noms de famille par ordre alphabétique ${
                isName && !sortDesc ? 'inversé' : ''
              }`}
              title={`Afficher la liste des bénéficiaires triée par noms de famille par ordre alphabétique ${
                isName && !sortDesc ? 'inversé' : ''
              }`}
              type='button'
            >
              <span className='mr-1'>Bénéficiaire</span>
              <SortIcon isSorted={isName} isDesc={sortDesc} />
            </button>
          </TH>
          <TH estCliquable={true}>
            <button
              className={columnHeaderButtonStyle}
              onClick={() => trierBeneficiaires(SortColumn.DERNIERE_ACTIVITE)}
              aria-label={`Afficher la liste des bénéficiaires triée par dates de dernière activité du bénéficiaire par ordre ${
                isDate && !sortDesc ? 'chronologique' : 'antéchronologique'
              }`}
              title={`Afficher la liste des bénéficiaires triée par dates de dernière activité du bénéficiaire par ordre ${
                isDate && !sortDesc ? 'chronologique' : 'antéchronologique'
              }`}
              type='button'
            >
              <span className='mr-1'>Dernière activité</span>
              <SortIcon isSorted={isDate} isDesc={sortDesc} />
            </button>
          </TH>

          {utiliseChat(conseiller) && (
            <TH estCliquable={true}>
              <button
                className={`${columnHeaderButtonStyle} mx-auto`}
                onClick={() => trierBeneficiaires(SortColumn.MESSAGES)}
                aria-label={`Afficher la liste des messages non lus par nombre ${
                  isMessage && !sortDesc ? 'croissant' : 'décroissant'
                }`}
                title={`Afficher la liste des messages non lus par nombre ${
                  isMessage && !sortDesc ? 'croissant' : 'décroissant'
                }`}
                type='button'
              >
                <span className='mr-1'>
                  Messages non lus par les bénéficiaires
                </span>
                <SortIcon isSorted={isMessage} isDesc={sortDesc} />
              </button>
            </TH>
          )}

          <TH>Voir le détail</TH>
        </TR>
      </thead>

      <tbody>
        {beneficiairesAffiches.map(
          (jeune: BeneficiaireAvecInfosComplementaires) => (
            <TR key={jeune.id}>
              <TD isBold className='rounded-l-base'>
                <span className='flex items-baseline'>
                  {jeune.structureMilo?.id === conseiller.structureMilo?.id &&
                    jeune.isReaffectationTemporaire && (
                      <span className='self-center mr-2'>
                        <IconComponent
                          name={IconName.Schedule}
                          focusable={false}
                          className='w-4 h-4'
                          role='img'
                          aria-labelledby={`label-beneficiaire-temporaire-${jeune.id}`}
                          title='bénéficiaire temporaire'
                        />
                        <span
                          id={`label-beneficiaire-temporaire-${jeune.id}`}
                          className='sr-only'
                        >
                          bénéficiaire temporaire
                        </span>
                      </span>
                    )}
                  {jeune.structureMilo?.id !== conseiller.structureMilo?.id && (
                    <span className='self-center mr-2'>
                      <IconComponent
                        name={IconName.Error}
                        focusable={false}
                        role='img'
                        aria-labelledby={`label-ml-differente-${jeune.id}`}
                        className='w-4 h-4 fill-warning'
                        title='Ce bénéficiaire est rattaché à une Mission Locale différente de la vôtre.'
                      />
                      <span
                        id={`label-ml-differente-${jeune.id}`}
                        className='sr-only'
                      >
                        Ce bénéficiaire est rattaché à une Mission Locale
                        différente de la vôtre.
                      </span>
                    </span>
                  )}
                  {getNomBeneficiaireComplet(jeune)}
                </span>
              </TD>
              <TD>
                {jeune.isActivated && toRelativeDateTime(jeune.lastActivity!)}
                {!jeune.isActivated && (
                  <span className='text-warning'>Compte non activé</span>
                )}
              </TD>

              {utiliseChat(conseiller) && (
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
              )}

              <TDLink
                href={`/mes-jeunes/${jeune.id}`}
                label={getRowLabel(jeune)}
              />
            </TR>
          )
        )}
      </tbody>
    </>
  )
}

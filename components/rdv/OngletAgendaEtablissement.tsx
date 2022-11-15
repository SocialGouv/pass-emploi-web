import { DateTime } from 'luxon'
import React, { useState } from 'react'

import EmptyStateImage from 'assets/images/empty_state.svg'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Tag } from 'components/ui/Indicateurs/Tag'
import { SelecteurPeriode } from 'components/ui/SelecteurPeriode'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import { TR } from 'components/ui/Table/TR'
import { AnimationCollective } from 'interfaces/evenement'
import {
  insertIntercalaires,
  ItemOuIntercalaire,
  renderListeWithIntercalaires,
} from 'presentation/Intercalaires'
import {
  TIME_24_H_SEPARATOR,
  toFrenchFormat,
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
  const [
    animationsCollectivesWithIntercalaires,
    setAnimationsCollectivesWithIntercalaires,
  ] = useState<ItemOuIntercalaire<AnimationCollective>[]>()

  async function chargerEvenements(dateDebut: DateTime, dateFin: DateTime) {
    const evenements = await recupererAnimationsCollectives(
      idEtablissement!,
      dateDebut,
      dateFin
    )
    setAnimationsCollectivesWithIntercalaires(
      insertIntercalaires(evenements, ({ date }) => date)
    )
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

  return (
    <>
      {idEtablissement && (
        <SelecteurPeriode
          onNouvellePeriode={chargerEvenements}
          nombreJours={7}
          trackNavigation={trackNavigation}
        />
      )}

      {!animationsCollectivesWithIntercalaires && <SpinningLoader />}

      {animationsCollectivesWithIntercalaires &&
        animationsCollectivesWithIntercalaires.length === 0 && (
          <div className='flex flex-col justify-center items-center'>
            <EmptyStateImage
              focusable={false}
              aria-hidden={true}
              className='w-[360px] h-[200px]'
            />
            <p className='mt-4 text-base-medium w-2/3 text-center'>
              Il n’y a pas d’animation collective sur cette période dans votre
              établissement.
            </p>
          </div>
        )}

      {animationsCollectivesWithIntercalaires &&
        animationsCollectivesWithIntercalaires.length > 0 && (
          <Table caption='Liste des animations collectives de mon établissement'>
            <THead>
              <TR isHeader={true}>
                <TH>Horaires</TH>
                <TH>Titre</TH>
                <TH>Type</TH>
                <TH>Statut</TH>
              </TR>
            </THead>
            <TBody>
              {renderListeWithIntercalaires(
                animationsCollectivesWithIntercalaires,
                (ac) => (
                  <TR
                    key={ac.id}
                    href={'/mes-jeunes/edition-rdv?idRdv=' + ac.id}
                    label={labelLien(ac)}
                  >
                    <TD>
                      {heure(ac)} - {ac.duree} min
                    </TD>
                    <TD>{ac.titre}</TD>
                    <TD>{tagType(ac)}</TD>
                    <TD>
                      <div className='flex items-center justify-between'>
                        {tagStatut(ac)}
                        <IconComponent
                          name={IconName.ChevronRight}
                          focusable={false}
                          aria-hidden={true}
                          className='w-6 h-6 fill-content_color'
                        />
                      </div>
                    </TD>
                  </TR>
                )
              )}
            </TBody>
          </Table>
        )}
    </>
  )
}

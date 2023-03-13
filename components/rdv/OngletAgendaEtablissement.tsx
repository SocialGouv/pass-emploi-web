import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'

import EmptyStateImage from 'assets/images/empty_state.svg'
import FiltresStatutAnimationsCollectives from 'components/rdv/FiltresStatutAnimationsCollectives'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { TagMetier, TagStatut } from 'components/ui/Indicateurs/Tag'
import { SelecteurPeriode } from 'components/ui/SelecteurPeriode'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import { TR } from 'components/ui/Table/TR'
import {
  AnimationCollective,
  StatutAnimationCollective,
} from 'interfaces/evenement'
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
  const [animationsCollectives, setAnimationsCollectives] = useState<
    AnimationCollective[]
  >([])
  const [animationsCollectivesFiltrees, setAnimationsCollectivesFiltrees] =
    useState<AnimationCollective[]>([])

  const [animationsCollectivesGroupees, setAnimationsCollectivesGroupees] =
    useState<ItemOuIntercalaire<AnimationCollective>[]>([])

  const [statutsValides, setStatutsValides] = useState<
    StatutAnimationCollective[]
  >([])

  async function chargerEvenementsPeriode(
    dateDebut: DateTime,
    dateFin: DateTime
  ) {
    const evenements = await recupererAnimationsCollectives(
      idEtablissement!,
      dateDebut,
      dateFin
    )
    setAnimationsCollectives(evenements)
  }

  function filtrerAnimationsCollectives() {
    if (!statutsValides.length)
      setAnimationsCollectivesFiltrees(animationsCollectives)
    else {
      const acFiltrees = animationsCollectives.filter((ac) =>
        statutsValides.includes(ac.statut)
      )
      setAnimationsCollectivesFiltrees(acFiltrees)
    }
  }

  useEffect(() => {
    filtrerAnimationsCollectives()
  }, [animationsCollectives, statutsValides])

  useEffect(() => {
    setAnimationsCollectivesGroupees(
      insertIntercalaires(animationsCollectivesFiltrees, ({ date }) => date)
    )
  }, [animationsCollectivesFiltrees])

  return (
    <>
      {idEtablissement && (
        <SelecteurPeriode
          onNouvellePeriode={chargerEvenementsPeriode}
          nombreJours={7}
          trackNavigation={trackNavigation}
        />
      )}

      {!animationsCollectivesGroupees && <SpinningLoader />}

      {animationsCollectivesGroupees &&
        animationsCollectivesGroupees.length === 0 && (
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

            {animationsCollectives.length > 0 && (
              <Button
                type='button'
                style={ButtonStyle.PRIMARY}
                onClick={() => setStatutsValides([])}
                className='m-auto mt-8'
              >
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        )}

      {animationsCollectivesGroupees &&
        animationsCollectivesGroupees.length > 0 && (
          <Table
            asDiv={true}
            caption={{
              text: 'Liste des animations collectives de mon établissement',
            }}
          >
            <THead>
              <TR isHeader={true}>
                <TH>Horaires</TH>
                <TH>Titre</TH>
                <TH>Type</TH>
                <TH>
                  <FiltresStatutAnimationsCollectives
                    onFiltres={setStatutsValides}
                    defaultValue={statutsValides}
                  />
                </TH>
              </TR>
            </THead>
            <TBody>
              {renderListeWithIntercalaires(
                animationsCollectivesGroupees,
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

function labelLien(ac: AnimationCollective): string {
  return `Consulter ${ac.type} ${statusProps(ac).label} du ${fullDate(
    ac
  )} à ${heure(ac)}`
}

function fullDate({ date }: AnimationCollective): string {
  return toFrenchFormat(date, WEEKDAY_MONTH_LONG)
}

function heure({ date }: AnimationCollective): string {
  return toFrenchFormat(date, TIME_24_H_SEPARATOR)
}

function tagType({ type }: AnimationCollective): JSX.Element {
  const color = type === 'Atelier' ? 'accent_2' : 'additional_2'
  const iconName =
    type === 'Information collective' ? IconName.ImportantOutline : undefined
  return (
    <TagMetier
      label={type}
      color={color}
      backgroundColor={color + '_lighten'}
      iconName={iconName}
    />
  )
}

function statusProps({ type, statut }: AnimationCollective): {
  label: string
  color: string
} {
  switch (statut) {
    case StatutAnimationCollective.AVenir:
      return { label: 'À venir', color: 'accent_1' }
    case StatutAnimationCollective.AClore:
      return { label: 'À clore', color: 'warning' }

    case StatutAnimationCollective.Close:
      return {
        label: type === 'Atelier' ? 'Clos' : 'Close',
        color: 'accent_2',
      }
  }
}

function tagStatut(ac: AnimationCollective): JSX.Element {
  const { label, color } = statusProps(ac)
  return (
    <TagStatut
      label={label}
      color={color}
      backgroundColor={color + '_lighten'}
    />
  )
}

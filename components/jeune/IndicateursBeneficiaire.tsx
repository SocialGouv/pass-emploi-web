import { DateTime } from 'luxon'
import React, { ReactElement } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Demarche, IndicateursSemaine } from 'interfaces/beneficiaire'
import { StatutDemarche } from 'interfaces/json/beneficiaire'
import { estMilo } from 'interfaces/structure'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toLongMonthDate, toShortDate } from 'utils/date'

type IndicateursBeneficiaireProps = {
  debutDeLaSemaine: DateTime
  finDeLaSemaine: DateTime
  indicateursSemaine: IndicateursSemaine | undefined
  demarches?: Demarche[]
}
export default function IndicateursBeneficiaire({
  debutDeLaSemaine,
  finDeLaSemaine,
  indicateursSemaine,
  demarches,
}: IndicateursBeneficiaireProps) {
  const [conseiller] = useConseiller()
  const withActionsEtRdvs = estMilo(conseiller.structure)

  const { demarchesCreees, demarchesTerminees, demarchesEnRetard } = (
    demarches ?? []
  ).reduce<{
    demarchesCreees: Demarche[]
    demarchesTerminees: Demarche[]
    demarchesEnRetard: Demarche[]
  }>(
    (acc, demarche) => {
      const dateCreation = DateTime.fromISO(demarche.dateCreation)
      const dateFin = DateTime.fromISO(demarche.dateFin)

      if (dateCreation >= debutDeLaSemaine) acc.demarchesCreees.push(demarche)

      if (
        dateFin >= debutDeLaSemaine &&
        demarche.statut === StatutDemarche.REALISEE
      )
        acc.demarchesTerminees.push(demarche)

      if (
        dateFin < DateTime.now().startOf('day') &&
        Boolean(
          demarche.statut !== StatutDemarche.REALISEE &&
            demarche.statut !== StatutDemarche.ANNULEE
        )
      )
        acc.demarchesEnRetard.push(demarche)

      return acc
    },
    { demarchesCreees: [], demarchesTerminees: [], demarchesEnRetard: [] }
  )

  return (
    <div className='grow shrink px-6'>
      <h2
        className='text-base-bold text-content-color'
        id='indicateurs-semaine'
      >
        Résumé pour la semaine du{' '}
        <span aria-label={toLongMonthDate(debutDeLaSemaine)}>
          {toShortDate(debutDeLaSemaine)}
        </span>{' '}
        au{' '}
        <span aria-label={toLongMonthDate(finDeLaSemaine)}>
          {toShortDate(finDeLaSemaine)}
        </span>
      </h2>

      <ul
        aria-describedby='indicateurs-semaine'
        className={`grid ${withActionsEtRdvs || demarches ? 'grid-rows-3' : 'grid-rows-2'} gap-x-1 grid-flow-col overflow-hidden ${!indicateursSemaine ? 'animate-pulse' : ''}`}
      >
        {withActionsEtRdvs && (
          <>
            <Indicateur
              iconName={IconName.Timer}
              count={indicateursSemaine?.actions.creees}
              label='actions créées'
              labelSingulier='action créée'
              colors='PRIMARY'
            />
            <Indicateur
              iconName={IconName.Check}
              count={indicateursSemaine?.actions.terminees}
              label='actions terminées'
              labelSingulier='action terminée'
              colors='SUCCESS'
            />
            <Indicateur
              iconName={IconName.Error}
              count={indicateursSemaine?.actions.enRetard}
              label='actions en retard'
              labelSingulier='action en retard'
              colors='WARNING'
            />
            <Indicateur
              iconName={IconName.EventOutline}
              count={indicateursSemaine?.rendezVous}
              label='RDV et ateliers'
              labelSingulier='RDV ou atelier'
              colors='PRIMARY'
            />
          </>
        )}

        {demarches && (
          <>
            <Indicateur
              iconName={IconName.Timer}
              count={demarchesCreees.length}
              label='démarches créées'
              labelSingulier='action créée'
              colors='PRIMARY'
            />
            <Indicateur
              iconName={IconName.Check}
              count={demarchesTerminees.length}
              label='démarches terminées'
              labelSingulier='action terminée'
              colors='SUCCESS'
            />
            <Indicateur
              iconName={IconName.Error}
              count={demarchesEnRetard.length}
              label='démarches en retard'
              labelSingulier='action en retard'
              colors='WARNING'
            />
          </>
        )}

        <Indicateur
          iconName={IconName.BookmarkOutline}
          count={indicateursSemaine?.offres.sauvegardees}
          label='offres enregistrées'
          labelSingulier='offre enregistrée'
          colors='PRIMARY'
        />
        <Indicateur
          iconName={IconName.Check}
          count={indicateursSemaine?.offres.postulees}
          label='offres postulées'
          labelSingulier='offre postulée'
          colors='SUCCESS'
        />
      </ul>
    </div>
  )
}

function Indicateur({
  iconName,
  count,
  label,
  labelSingulier,
  colors,
}: {
  iconName: IconName
  count: number | undefined
  label: string
  labelSingulier: string
  colors: IndicateurColor
}): ReactElement {
  return (
    // Internal border : https://geary.co/internal-borders-css-grid/
    <li
      className='relative py-5 flex flex-wrap layout-base:flex-nowrap items-center gap-3 after:absolute after:content-[""] after:bg-grey-500 after:w-full after:h-[1px] after:bottom-[-1px]'
      aria-label={count === undefined ? 'Chargement en cours' : undefined}
    >
      <IconComponent
        name={iconName}
        className={'p-1 h-6 w-6 shrink-0 rounded-base ' + styles[colors]}
        aria-hidden={true}
        focusable={false}
      />
      <span className='text-m-bold'>{count ?? '--'}</span>
      <span className='text-s-regular'>
        {count === 1 ? labelSingulier : label}
      </span>
    </li>
  )
}

type IndicateurColor = 'PRIMARY' | 'SUCCESS' | 'WARNING'
const styles: {
  [key in IndicateurColor]: string
} = {
  PRIMARY: 'fill-primary bg-primary-lighten',
  SUCCESS: 'fill-success bg-success-lighten',
  WARNING: 'fill-warning bg-warning-lighten',
}

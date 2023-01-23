import { DateTime } from 'luxon'
import Link from 'next/link'
import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import TileIndicateur from 'components/ui/TileIndicateur'
import { IndicateursSemaine } from 'interfaces/jeune'
import { toFrenchString } from 'utils/date'

type ResumeIndicateursJeuneProps = {
  idJeune: string
  debutDeLaSemaine: DateTime
  finDeLaSemaine: DateTime
  indicateursSemaine: IndicateursSemaine | undefined
}

export function ResumeIndicateursJeune({
  idJeune,
  debutDeLaSemaine,
  finDeLaSemaine,
  indicateursSemaine,
}: ResumeIndicateursJeuneProps) {
  return (
    <div className='border border-solid rounded-base w-full p-4 border-grey_100'>
      <h2 className='text-m-bold text-grey_800'>
        Les indicateurs de la semaine
      </h2>
      <p className='mb-4'>
        du {toFrenchString(debutDeLaSemaine)} au{' '}
        {toFrenchString(finDeLaSemaine)}
      </p>
      <div
        className={`flex flex-wrap gap-6 ${
          !indicateursSemaine ? 'animate-pulse' : ''
        }`}
      >
        <div className='text-content_color text-base-bold'>
          <h3 className='mb-2'>Les actions</h3>
          <ul className='flex gap-2'>
            <TileIndicateur
              valeur={indicateursSemaine?.actions.creees.toString() ?? '-'}
              label={
                indicateursSemaine?.actions.creees !== 1 ? 'Créées' : 'Créée'
              }
              bgColor='primary_lighten'
              textColor='primary_darken'
            />
            <TileIndicateur
              valeur={indicateursSemaine?.actions.terminees.toString() ?? '-'}
              label={
                indicateursSemaine?.actions.terminees !== 1
                  ? 'Terminées'
                  : 'Terminée'
              }
              bgColor='accent_2_lighten'
              textColor='accent_2'
              iconName={IconName.RoundedCheck}
            />
            <TileIndicateur
              valeur={indicateursSemaine?.actions.enRetard.toString() ?? '-'}
              label='En retard'
              bgColor='alert_lighten'
              textColor='content_color'
              iconName={IconName.ImportantOutline}
            />
          </ul>
        </div>
        <div className='text-content_color text-base-bold'>
          <h3 className='mb-2'>Les événements</h3>
          <div className='flex gap-2'>
            <TileIndicateur
              valeur={indicateursSemaine?.rendezVous.toString() ?? '-'}
              label='Cette semaine'
              bgColor='primary_lighten'
              textColor='primary_darken'
            />
          </div>
        </div>
      </div>
      <LienVersIndicateurs idJeune={idJeune} />
    </div>
  )
}

function LienVersIndicateurs(props: { idJeune: string }) {
  return (
    <Link
      href={`/mes-jeunes/${props.idJeune}/indicateurs`}
      className='flex items-center text-content_color underline hover:text-primary hover:fill-primary mt-4'
    >
      Voir plus d’indicateurs
      <IconComponent
        name={IconName.ChevronRight}
        className='w-4 h-5 fill-[inherit]'
        aria-hidden={true}
        focusable={false}
      />
    </Link>
  )
}

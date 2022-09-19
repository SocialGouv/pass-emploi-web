import { DateTime } from 'luxon'
import React from 'react'

import { IconName } from 'components/ui/IconComponent'
import TileIndicateur from 'components/ui/TileIndicateur'
import { IndicateursSemaine } from 'interfaces/jeune'

type IndicateursJeuneProps = {
  debutDeLaSemaine: DateTime
  finDeLaSemaine: DateTime
  indicateursSemaine: IndicateursSemaine | undefined
}

export function IndicateursJeune({
  debutDeLaSemaine,
  finDeLaSemaine,
  indicateursSemaine,
}: IndicateursJeuneProps) {
  return (
    <div className='border border-solid rounded-medium w-full p-4 border-grey_100'>
      <h2 className='text-m-bold'>Les indicateurs de la semaine</h2>
      <p className='mb-4'>
        du {debutDeLaSemaine.toLocaleString()} au{' '}
        {finDeLaSemaine.toLocaleString()}
      </p>
      <div
        className={`flex gap-6 ${!indicateursSemaine ? 'animate-pulse' : ''}`}
      >
        <div className='text-primary_darken text-base-bold'>
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
              iconName={IconName.WarningRounded}
            />
          </ul>
        </div>
        <div className='text-primary_darken text-base-bold'>
          <h3 className='mb-2'>Les rendez-vous</h3>
          <div className='flex gap-2'>
            <TileIndicateur
              valeur={indicateursSemaine?.rendezVous.toString() ?? '-'}
              label='Cette semaine'
              bgColor='primary_lighten'
              textColor='primary_darken'
            />
          </div>
        </div>
        <div></div>
      </div>
    </div>
  )
}

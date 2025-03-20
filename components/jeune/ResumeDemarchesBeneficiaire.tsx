import { DateTime } from 'luxon'
import React from 'react'

import { IconName } from 'components/ui/IconComponent'
import TileIndicateur from 'components/ui/TileIndicateur'
import { Demarche } from 'interfaces/beneficiaire'
import { StatutDemarche } from 'interfaces/json/beneficiaire'
import { toShortDate } from 'utils/date'

type ResumeIndicateursJeuneProps = {
  debutDeLaSemaine: DateTime
  finDeLaSemaine: DateTime
  demarches: Demarche[]
}

export default function ResumeDemarchesBeneficiaire({
  debutDeLaSemaine,
  finDeLaSemaine,
  demarches,
}: ResumeIndicateursJeuneProps) {
  const { demarchesCrees, demarchesTerminees, demarchesEnRetard } =
    demarches.reduce<{
      demarchesCrees: Demarche[]
      demarchesTerminees: Demarche[]
      demarchesEnRetard: Demarche[]
    }>(
      (acc, demarche) => {
        const dateCreation = DateTime.fromISO(demarche.dateCreation)
        const dateFin = DateTime.fromISO(demarche.dateFin)

        if (dateCreation >= debutDeLaSemaine) acc.demarchesCrees.push(demarche)

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
      { demarchesCrees: [], demarchesTerminees: [], demarchesEnRetard: [] }
    )

  return (
    <div className='border border-solid rounded-base w-full p-4 border-grey-100'>
      <h2 className='text-m-bold text-grey-800'>Cette semaine</h2>
      <p className='mb-4'>
        du {toShortDate(debutDeLaSemaine)} au {toShortDate(finDeLaSemaine)}
      </p>
      <div
        className={`flex flex-wrap gap-6 ${!demarches ? 'animate-pulse' : ''}`}
      >
        <div className='text-content-color text-base-bold'>
          <h3 className='mb-2'>Les démarches</h3>
          <ul className='flex gap-2'>
            <TileIndicateur
              valeur={demarchesCrees.length.toString() ?? '-'}
              label={demarchesCrees.length !== 1 ? 'Créées' : 'Créée'}
              color='PRIMARY'
            />
            <TileIndicateur
              valeur={demarchesTerminees.length.toString() ?? '-'}
              label={demarchesTerminees.length !== 1 ? 'Terminées' : 'Terminée'}
              color='ACCENT_3'
              iconName={IconName.CheckCircleFill}
            />
            <TileIndicateur
              valeur={demarchesEnRetard.length.toString() ?? '-'}
              label='En retard'
              color='WARNING'
              iconName={IconName.Error}
            />
          </ul>
        </div>
      </div>
    </div>
  )
}

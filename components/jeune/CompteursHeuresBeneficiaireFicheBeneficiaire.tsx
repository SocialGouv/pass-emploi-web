import React from 'react'

import { ProgressComptageHeure } from 'components/ui/Indicateurs/ProgressComptageHeure'
import { CompteurHeuresFicheBeneficiaire } from 'interfaces/beneficiaire'
import { toFrenchDateTime } from 'utils/date'

import IconComponent, { IconName } from '../ui/IconComponent'

export function CompteursHeuresBeneficiaireFicheBeneficiaire({
  comptageHeures,
}: {
  comptageHeures?: CompteurHeuresFicheBeneficiaire | null
}) {
  return (
    <>
      {comptageHeures && (
        <div className='flex flex-col gap-2 w-full bg-primary-lighten px-6 py-4 rounded-md mt-2'>
          <p className='self-end text-xs-regular'>
            Dernière mise à jour le{' '}
            {toFrenchDateTime(comptageHeures.dateDerniereMiseAJour)}
          </p>
          <div className='flex gap-2 mt-2'>
            <div className='grow flex flex-col gap-1'>
              <ProgressComptageHeure
                heures={comptageHeures.nbHeuresDeclarees}
                label='déclarée'
                bgColor='white'
              />
            </div>

            <div className='grow flex flex-col gap-1'>
              <ProgressComptageHeure
                heures={comptageHeures.nbHeuresValidees}
                label='validée'
                bgColor='white'
              />
            </div>
          </div>
        </div>
      )}

      {!comptageHeures && (
        <div className='w-full bg-primary-lighten px-6 py-4 rounded-md mt-2'>
          <p className='text-sm text-warning'>
            <IconComponent
              name={IconName.Info}
              focusable={false}
              aria-hidden={true}
              className='inline h-6 w-6 mr-1 fill-current'
            />
            Comptage des heures indisponible
          </p>
        </div>
      )}
    </>
  )
}

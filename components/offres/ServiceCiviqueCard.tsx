import React from 'react'

import OffreCard from 'components/offres/OffreCard'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { DataTag } from 'components/ui/Indicateurs/DataTag'
import { TagMetier } from 'components/ui/Indicateurs/Tag'
import { BaseServiceCivique } from 'interfaces/offre'
import { toLongMonthDate } from 'utils/date'

interface ServiceCiviqueCardProps {
  offre: BaseServiceCivique
  withPartage?: boolean
}

export default function ServiceCiviqueCard({
  offre,
  withPartage,
}: ServiceCiviqueCardProps) {
  return (
    <OffreCard
      offrePath={'service-civique/' + offre.id}
      titreLien={offre.titre}
      withPartage={withPartage}
    >
      <TagMetier
        label='Service civique'
        className='text-content_color bg-additional_2_lighten text-s-regular mb-4'
      />

      <h3 className='text-base-bold mb-2'>{offre.titre}</h3>
      <dl>
        <dt className='sr-only'>Domaine</dt>
        <dd className='text-base-bold text-accent_1 mb-2 capitalize'>
          {offre.domaine}
        </dd>

        {offre.organisation && (
          <>
            <dt className='sr-only'>Organisation</dt>
            <dd className='text-s-bold mb-2'>{offre.organisation}</dd>
          </>
        )}

        {offre.ville && (
          <>
            <dt className='sr-only'>Ville</dt>
            <dd className='flex items-center text-s-regular text-grey_800 mb-5'>
              <IconComponent
                name={IconName.LocationOn}
                className='w-4 h-4 mr-3 fill-primary'
                focusable={false}
                aria-hidden={true}
              />
              {offre.ville}
            </dd>
          </>
        )}

        {offre.dateDeDebut && (
          <>
            <dt className='sr-only'>Date de début</dt>
            <dd>
              <DataTag text={'Dès le ' + toLongMonthDate(offre.dateDeDebut)} />
            </dd>
          </>
        )}
      </dl>
    </OffreCard>
  )
}

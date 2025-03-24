import React from 'react'

import OffreCard from 'components/offres/OffreCard'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { DataTag } from 'components/ui/Indicateurs/DataTag'
import { TagMetier } from 'components/ui/Indicateurs/Tag'
import { BaseImmersion } from 'interfaces/offre'

interface ImmersionCardProps {
  offre: BaseImmersion
  withPartage?: boolean
}

export default function ImmersionCard({
  offre,
  withPartage = false,
}: ImmersionCardProps) {
  return (
    <OffreCard
      offrePath={'immersion/' + offre.id}
      titreLien={'chez ' + offre.nomEtablissement}
      withPartage={withPartage}
    >
      <TagMetier
        label='Immersion'
        className='text-content-color bg-additional-1-lighten text-s-regular mb-4'
      />

      <h3 className='text-base-bold mb-2'>{offre.titre}</h3>
      <dl>
        <dt className='sr-only'>Établissement</dt>
        <dd className='text-s-bold mb-2'>{offre.nomEtablissement}</dd>

        <dt className='sr-only'>Ville</dt>
        <dd className='flex items-center text-s-regular text-grey-800 mb-5'>
          <IconComponent
            name={IconName.LocationOn}
            className='w-4 h-4 mr-3 fill-primary'
            focusable={false}
            aria-hidden={true}
          />
          {offre.ville}
        </dd>

        <dt className='sr-only'>Secteur</dt>
        <dd>
          <DataTag text={offre.secteurActivite} />
        </dd>
      </dl>
    </OffreCard>
  )
}

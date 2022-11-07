import React from 'react'

import OffreCard from 'components/offres/OffreCard'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { DataTag } from 'components/ui/Indicateurs/DataTag'
import { Tag } from 'components/ui/Indicateurs/Tag'
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
      <Tag
        label='Immersion'
        color='accent_2'
        backgroundColor='white'
        className='text-s-regular mb-4'
      />

      <h3 className='text-base-bold mb-2'>{offre.titre}</h3>
      <p className='text-s-bold mb-2'>{offre.nomEtablissement}</p>
      <p className='flex items-center text-s-regular text-grey_800 mb-5'>
        <IconComponent
          name={IconName.Location}
          className='w-4 h-4 mr-3 fill-primary'
          focusable={false}
          aria-hidden={true}
        />
        {offre.ville}
      </p>

      <DataTag text={offre.secteurActivite} />
    </OffreCard>
  )
}

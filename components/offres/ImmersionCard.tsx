import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { DataTag } from 'components/ui/Indicateurs/DataTag'
import { Tag } from 'components/ui/Indicateurs/Tag'
import { BaseImmersion } from 'interfaces/offre'

interface ImmersionCardProps {
  offre: BaseImmersion
}

export default function ImmersionCard({ offre }: ImmersionCardProps) {
  return (
    <div className='rounded-small shadow-s p-6'>
      <div className='flex justify-between mb-4'>
        <Tag
          label='Immersion'
          color='accent_2'
          backgroundColor='white'
          className='text-s-regular'
        />
      </div>

      <h3 className='text-base-bold mb-2'>{offre.metier}</h3>
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

      <div className='flex justify-between'>
        <DataTag text={offre.secteurActivite} />
      </div>
    </div>
  )
}

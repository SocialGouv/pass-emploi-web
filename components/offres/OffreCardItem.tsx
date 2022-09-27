import Link from 'next/link'
import React from 'react'

import IconComponent, { IconName } from '../ui/IconComponent'
import { DataTag } from '../ui/Indicateurs/DataTag'
import { Tag } from '../ui/Indicateurs/Tag'

import { OffreEmploiItem } from 'interfaces/offre-emploi'

interface OffreItemCardProps {
  offre: OffreEmploiItem
}

export function OffreCardItem({ offre }: OffreItemCardProps) {
  return (
    <li className='rounded-small shadow-s p-6 mb-4'>
      <div className='flex justify-between'>
        <Tag
          label='Emploi'
          color='accent_2'
          backgroundColor='white'
          className='mb-4 text-s-regular'
        />
        <Link href={`/offres/${offre.id}/partage`}>
          <a
            aria-label={`Partager offre numéro ${offre.id}`}
            className='flex items-center text-base-bold text-primary'
          >
            <IconComponent
              name={IconName.Partage}
              className='w-4 h-4 mr-3 fill-primary'
              focusable={false}
              aria-hidden={true}
            />
            Partager
          </a>
        </Link>
      </div>
      <h3 className='text-base-bold text-accent_1 mb-2'>Offre n°{offre.id}</h3>
      <p className='text-base-bold mb-2'>{offre.titre}</p>
      <p className='text-s-bold mb-2'>{offre.nomEntreprise}</p>
      <p className='flex items-center text-s-regular text-grey_800 mb-6'>
        <IconComponent
          name={IconName.Location}
          className='w-4 h-4 mr-3 fill-primary'
          focusable={false}
          aria-hidden={true}
        />
        {offre.localisation.nom}
      </p>
      <>
        <DataTag type={offre.typeContrat} className='mr-10' />
        <DataTag type={offre.duree} />
      </>
    </li>
  )
}

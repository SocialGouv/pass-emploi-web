import Link from 'next/link'
import React from 'react'

import LienPartageOffre from 'components/offres/LienPartageOffre'
import { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { DataTag } from 'components/ui/Indicateurs/DataTag'
import { Tag } from 'components/ui/Indicateurs/Tag'
import { BaseOffreEmploi } from 'interfaces/offre'

interface OffreItemCardProps {
  offre: BaseOffreEmploi
  withPartage?: boolean
}

export function OffreCard({ offre, withPartage = false }: OffreItemCardProps) {
  return (
    <div className='rounded-small shadow-s p-6'>
      <div className='flex justify-between mb-4'>
        <Tag
          label='Emploi'
          color='accent_2'
          backgroundColor='white'
          className='text-s-regular'
        />
        {withPartage && (
          <LienPartageOffre idOffre={offre.id} style={ButtonStyle.TERTIARY} />
        )}
      </div>

      <h3 className='text-base-bold text-accent_1 mb-2'>Offre n°{offre.id}</h3>
      <p className='text-base-bold mb-2'>{offre.titre}</p>
      {offre.nomEntreprise && (
        <p className='text-s-bold mb-2'>{offre.nomEntreprise}</p>
      )}
      {offre.localisation && (
        <>
          <p className='flex items-center text-s-regular text-grey_800 mb-5'>
            <IconComponent
              name={IconName.Location}
              className='w-4 h-4 mr-3 fill-primary'
              focusable={false}
              aria-hidden={true}
            />
            {offre.localisation}
          </p>
        </>
      )}

      <div className='flex justify-between'>
        <div>
          <DataTag text={offre.typeContrat} className='mr-6' />
          {offre.duree && <DataTag text={offre.duree} />}
        </div>
        <div>
          <Link href={`/offres/${offre.id}`}>
            <a
              aria-label={`Détail de l’offre ${offre.id}`}
              className='flex items-center text-s-regular hover:text-primary'
            >
              Voir le détail
              <IconComponent
                name={IconName.ChevronRight}
                className='w-4 h-4 mr-3 fill-primary'
                focusable={false}
                aria-hidden={true}
              />
            </a>
          </Link>
        </div>
      </div>
    </div>
  )
}

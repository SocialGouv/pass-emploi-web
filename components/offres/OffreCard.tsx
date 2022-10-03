import Link from 'next/link'
import React from 'react'

import { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { DataTag } from 'components/ui/Indicateurs/DataTag'
import { Tag } from 'components/ui/Indicateurs/Tag'
import { BaseOffreEmploi } from 'interfaces/offre-emploi'

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
          <ButtonLink
            href={`/offres/${offre.id}/partage`}
            style={ButtonStyle.TERTIARY}
          >
            <IconComponent
              name={IconName.Partage}
              className='w-4 h-4 mr-3 fill-primary'
              focusable={false}
              aria-hidden={true}
            />
            Partager <span className='sr-only'>offre numéro {offre.id}</span>
          </ButtonLink>
        )}
      </div>

      <h3 className='text-base-bold text-accent_1 mb-2'>Offre n°{offre.id}</h3>
      <p className='text-base-bold mb-2'>{offre.titre}</p>
      <p className='text-s-bold mb-2'>{offre.nomEntreprise}</p>
      <p className='flex items-center text-s-regular text-grey_800 mb-5'>
        <IconComponent
          name={IconName.Location}
          className='w-4 h-4 mr-3 fill-primary'
          focusable={false}
          aria-hidden={true}
        />
        {offre.localisation}
      </p>

      <div className='flex justify-between'>
        <div>
          <DataTag type={offre.typeContrat} className='mr-6' />
          {offre.duree && <DataTag type={offre.duree} />}
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

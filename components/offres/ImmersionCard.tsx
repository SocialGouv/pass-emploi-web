import Link from 'next/link'
import React from 'react'

import LienPartageOffre from 'components/offres/LienPartageOffre'
import { ButtonStyle } from 'components/ui/Button/Button'
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
    <div className='rounded-small shadow-s p-6'>
      <div className='flex justify-between mb-4'>
        <Tag
          label='Immersion'
          color='accent_2'
          backgroundColor='white'
          className='text-s-regular'
        />
        {withPartage && (
          <LienPartageOffre
            titreOffre={'chez ' + offre.nomEtablissement}
            href={`/offres/immersion/${offre.id}/partage`}
            style={ButtonStyle.TERTIARY}
          />
        )}
      </div>

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

      <div className='flex justify-between'>
        <DataTag text={offre.secteurActivite} />
        <Link href={`/offres/immersion/${offre.id}`}>
          <a
            aria-label={`Détail de l’immersion chez ${offre.nomEtablissement}`}
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
  )
}

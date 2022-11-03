import React from 'react'

import OffreCard from 'components/offres/OffreCard'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { DataTag } from 'components/ui/Indicateurs/DataTag'
import { Tag } from 'components/ui/Indicateurs/Tag'
import { BaseOffreEmploi, TypeOffre } from 'interfaces/offre'

interface OffreEmploiCardProps {
  offre: BaseOffreEmploi
  withPartage?: boolean
}

export default function OffreEmploiCard({
  offre,
  withPartage = false,
}: OffreEmploiCardProps) {
  return (
    <OffreCard
      offrePath={'emploi/' + offre.id}
      titreLien={offre.titre}
      withPartage={withPartage}
    >
      <Tag
        label={offre.type === TypeOffre.ALTERNANCE ? 'Alternance' : 'Emploi'}
        color='accent_2'
        backgroundColor='white'
        className='text-s-regular mb-4'
      />

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

      <div className='flex'>
        <DataTag text={offre.typeContrat} className='mr-6' />
        {offre.duree && <DataTag text={offre.duree} />}
      </div>
    </OffreCard>
  )
}

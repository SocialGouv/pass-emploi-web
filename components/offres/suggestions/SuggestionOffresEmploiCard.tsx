import React from 'react'

import { IconName } from 'components/ui/IconComponent'
import { DataTag } from 'components/ui/Indicateurs/DataTag'

interface SuggestionOffresEmploiCardProps {
  titre: string
  motsCles: string
  labelLocalite: string
}

export default function SuggestionOffresEmploiCard({
  titre,
  motsCles,
  labelLocalite,
}: SuggestionOffresEmploiCardProps) {
  return (
    <div className='rounded-small shadow-s p-6'>
      <p className='text-base-bold mb-2'>{titre}</p>
      <DataTag text={'Offre d’emploi'} />
      <DataTag className='ml-2' text={motsCles} />
      {/* TODO-1027 autre moyen pour passer à la ligne que d'encapsuler dans div ? */}
      <div className='mt-4'>
        <DataTag text={labelLocalite} iconName={IconName.Location} />
      </div>
    </div>
  )
}

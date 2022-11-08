import React from 'react'

import { IconName } from 'components/ui/IconComponent'
import { DataTag } from 'components/ui/Indicateurs/DataTag'
import { TypeOffre } from 'interfaces/offre'

interface SuggestionCardProps {
  type: TypeOffre
  titre: string
  motsCles: string
  labelLocalite: string
}

export default function SuggestionCard({
  type,
  titre,
  motsCles,
  labelLocalite,
}: SuggestionCardProps) {
  function getTypeLabel(): string {
    switch (type) {
      case TypeOffre.EMPLOI:
        return 'Offre d’emploi'
      case TypeOffre.SERVICE_CIVIQUE:
      case TypeOffre.IMMERSION:
      case TypeOffre.ALTERNANCE:
        return ''
    }
  }

  return (
    <div className='rounded-large shadow-s p-6'>
      <h2 className='text-base-bold mb-2'>{titre}</h2>
      <DataTag text={getTypeLabel()} />
      <DataTag className='ml-2' text={motsCles} />
      <div className='mt-4'>
        <DataTag text={labelLocalite} iconName={IconName.Location} />
      </div>
    </div>
  )
}

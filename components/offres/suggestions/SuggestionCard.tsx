import React from 'react'

import { IconName } from 'components/ui/IconComponent'
import { DataTag } from 'components/ui/Indicateurs/DataTag'
import { TypeOffre } from 'interfaces/offre'

interface SuggestionCardProps {
  type: TypeOffre
  titre: string
  labelLocalite: string
  labelMetier?: string
}

export default function SuggestionCard({
  type,
  titre,
  labelLocalite,
  labelMetier,
}: SuggestionCardProps) {
  function getTypeLabel(): string {
    switch (type) {
      case TypeOffre.EMPLOI:
        return 'Offre d’emploi'
      case TypeOffre.ALTERNANCE:
        return 'Alternance'
      case TypeOffre.SERVICE_CIVIQUE:
        return 'Service civique'
      case TypeOffre.IMMERSION:
        return 'Immersion'
    }
  }

  return (
    <div className='rounded-large shadow-s p-6'>
      <h2 className='text-base-bold mb-2'>{titre}</h2>
      <DataTag text={getTypeLabel()} />
      {labelMetier && <DataTag className='ml-2' text={labelMetier} />}
      <div className='mt-4'>
        <DataTag text={labelLocalite} iconName={IconName.Location} />
      </div>
    </div>
  )
}

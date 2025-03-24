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
    <div className='bg-primary-lighten rounded-base shadow-base p-6'>
      <h2 className='text-base-bold mb-2'>{titre}</h2>
      <dl>
        <dt className='sr-only'>Type</dt>
        <dd className='inline'>
          <DataTag text={getTypeLabel()} style='secondary' />
        </dd>
        {labelMetier && (
          <>
            <dt className='sr-only'>Métier</dt>
            <dd className='inline'>
              <DataTag className='ml-2' text={labelMetier} style='secondary' />
            </dd>
          </>
        )}
        <dt className='sr-only'>Localité</dt>
        <dd className='mt-4'>
          <DataTag
            text={labelLocalite}
            iconName={IconName.LocationOn}
            style='secondary'
          />
        </dd>
      </dl>
    </div>
  )
}

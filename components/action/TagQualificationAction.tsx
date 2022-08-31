import React from 'react'

import { IconName } from 'components/ui/IconComponent'
import { Tag } from 'components/ui/Indicateurs/Tag'
import { StatutAction } from 'interfaces/action'

interface Props {
  statut: StatutAction
  qualification?: {
    libelle: string
    isSituationNonProfessionnelle: boolean
  }
}

export default function TagQualificationAction({
  statut,
  qualification,
}: Props) {
  return (
    <>
      {statut === StatutAction.Terminee && !qualification && (
        <Tag
          label={'Action à qualifier'}
          color='accent_2'
          backgroundColor='accent_2_lighten'
          iconName={IconName.Pending}
          className='mb-4 border-none'
        />
      )}
      {qualification && qualification.isSituationNonProfessionnelle && (
        <Tag
          label={qualification.libelle}
          color='accent_4'
          backgroundColor='accent_4_lighten'
          iconName={IconName.Suitcase}
          className='mb-4'
        />
      )}
      {qualification && !qualification.isSituationNonProfessionnelle && (
        <Tag
          label={qualification.libelle}
          color='accent_5'
          backgroundColor='accent_5_lighten'
          className='mb-4'
        />
      )}
    </>
  )
}

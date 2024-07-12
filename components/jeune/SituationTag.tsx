import React from 'react'

import { TagMetier } from 'components/ui/Indicateurs/Tag'
import { CategorieSituation } from 'interfaces/jeune'

interface TagProps {
  situation: CategorieSituation
  className?: string
}

const mappedSituation: {
  [key in CategorieSituation]: {
    color: string
    backgroundColor: string
  }
} = {
  Emploi: {
    color: 'accent_1',
    backgroundColor: 'accent_1_lighten',
  },
  'Contrat en Alternance': {
    color: 'accent_1',
    backgroundColor: 'accent_1_lighten',
  },
  Formation: {
    color: 'accent_3',
    backgroundColor: 'accent_3_lighten',
  },
  'Immersion en entreprise': {
    color: 'accent_1',
    backgroundColor: 'accent_1_lighten',
  },
  Pmsmp: {
    color: 'accent_1',
    backgroundColor: 'accent_1_lighten',
  },
  'Contrat de volontariat - bénévolat': {
    color: 'accent_3',
    backgroundColor: 'accent_3_lighten',
  },
  Scolarité: {
    color: 'accent_3',
    backgroundColor: 'accent_3_lighten',
  },
  "Demandeur d'emploi": {
    color: 'grey_800',
    backgroundColor: 'grey_100',
  },
  'Sans situation': {
    color: 'grey_800',
    backgroundColor: 'grey_100',
  },
}

export default function SituationTag({ situation, className }: TagProps) {
  const { color, backgroundColor } = mappedSituation[situation]
  return (
    <TagMetier
      label={situation}
      color={color}
      backgroundColor={backgroundColor}
      className={className}
    />
  )
}

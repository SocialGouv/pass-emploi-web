import React from 'react'

import { TagMetier } from 'components/ui/Indicateurs/Tag'
import { CategorieSituation } from 'interfaces/beneficiaire'

interface TagProps {
  situation: CategorieSituation
}

export default function SituationTag({ situation }: TagProps) {
  return <TagMetier label={situation} className={situationsStyles[situation]} />
}

const situationsStyles: {
  [key in CategorieSituation]: string
} = {
  Emploi: 'text-accent-1 bg-accent-1-lighten',
  'Contrat en Alternance': 'text-accent-1 bg-accent-1-lighten',
  Formation: 'text-accent-3 bg-accent-3-lighten',
  Immersion: 'text-accent-1 bg-accent-1-lighten',
  Pmsmp: 'text-accent-1 bg-accent-1-lighten',
  'Contrat de volontariat - bénévolat': 'text-accent-3 bg-accent-3-lighten',
  Scolarité: 'text-accent-3 bg-accent-3-lighten',
  "Demandeur d'emploi": 'text-grey-800 bg-grey-100',
  'Sans situation': 'text-grey-800 bg-grey-100',
}

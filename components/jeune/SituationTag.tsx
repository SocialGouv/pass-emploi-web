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
  Emploi: 'text-accent_1 bg-accent_1_lighten',
  'Contrat en Alternance': 'text-accent_1 bg-accent_1_lighten',
  Formation: 'text-accent_3 bg-accent_3_lighten',
  Immersion: 'text-accent_1 bg-accent_1_lighten',
  Pmsmp: 'text-accent_1 bg-accent_1_lighten',
  'Contrat de volontariat - bénévolat': 'text-accent_3 bg-accent_3_lighten',
  Scolarité: 'text-accent_3 bg-accent_3_lighten',
  "Demandeur d'emploi": 'text-grey_800 bg-grey_100',
  'Sans situation': 'text-grey_800 bg-grey_100',
}

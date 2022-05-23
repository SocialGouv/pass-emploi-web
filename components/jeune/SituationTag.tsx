import React from 'react'

import { Tag } from 'components/ui/Tag'
import { SituationJeune } from 'interfaces/jeune'

interface TagProps {
  situation: SituationJeune
}

const mappedSituation: {
  [key in SituationJeune]: {
    label: string
    color: string
    colorLighten: string
  }
} = {
  Emploi: {
    label: 'Emploi',
    color: 'accent_3',
    colorLighten: 'accent_3_lighten',
  },
  'Contrat en Alternance': {
    label: 'Contrat en Alternance',
    color: 'accent_3',
    colorLighten: 'accent_3_lighten',
  },
  Formation: {
    label: 'Formation',
    color: 'accent_3',
    colorLighten: 'accent_3_lighten',
  },
  'Immersion en entreprise': {
    label: 'Immersion en entreprise',
    color: 'accent_3',
    colorLighten: 'accent_3_lighten',
  },
  Pmsmp: {
    label: 'Pmsmp',
    color: 'accent_1',
    colorLighten: 'accent_1_lighten',
  },
  'Contrat de volontariat - bénévolat': {
    label: 'Contrat de volontariat - bénévolat',
    color: 'accent_1',
    colorLighten: 'accent_1_lighten',
  },
  Scolarité: {
    label: 'Scolarité',
    color: 'accent_3',
    colorLighten: 'accent_3_lighten',
  },
  "Demandeur d'emploi": {
    label: "Demandeur d'emploi",
    color: 'accent_1',
    colorLighten: 'accent_1_lighten',
  },
  'Sans situation': {
    label: 'Sans situation',
    color: 'grey_800',
    colorLighten: 'grey_100',
  },
}

export default function SituationTag({ situation }: TagProps) {
  const { label, color, colorLighten } = mappedSituation[situation]
  return <Tag label={label} color={color} colorLighten={colorLighten} />
}

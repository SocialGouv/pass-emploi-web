export type Departement = {
  code: string
  libelle: string
  type: 'DEPARTEMENT'
}
export type Commune = {
  code: string
  libelle: string
  type: 'COMMUNE'
  longitude: number
  latitude: number
}

export type TypeLocalite = 'DEPARTEMENT' | 'COMMUNE'

export type Localite = Commune | Departement

export type Metier = { code: string; libelle: string }

export type Agence = {
  id: string
  nom: string
  codeDepartement: string
}

export type MissionLocale = {
  id: string
  nom: string
}

export type DomaineServiceCivique = {
  code: string
  libelle: string
}

export interface MotifSuppressionBeneficiaire {
  motif: string
  description?: string
}

export type TypeEvenementReferentiel = {
  code: string
  label: string
  categorie: string
}

export function isTypeAnimationCollective(
  type: TypeEvenementReferentiel
): boolean {
  return type.categorie === 'CEJ_AC'
}

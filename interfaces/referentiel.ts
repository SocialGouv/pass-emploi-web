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
export type Localite = Commune | Departement

export type Metier = { code: string; libelle: string }

export type Agence = {
  id: string
  nom: string
}

export type DomaineServiceCivique = {
  code: string
  libelle: string
}

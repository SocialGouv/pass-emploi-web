import { SituationNonProfessionnelle } from 'interfaces/action'
import {
  ConseillerHistorique,
  Demarche,
  DetailBeneficiaire,
  MetadonneesFavoris,
} from 'interfaces/beneficiaire'
import { EvenementListItem } from 'interfaces/evenement'
import { Offre, Recherche } from 'interfaces/favoris'

export type Onglet = OngletMilo | OngletPasMilo
export type BaseFiche = {
  estMilo: boolean
  beneficiaire: DetailBeneficiaire
  historiqueConseillers: ConseillerHistorique[]
  metadonneesFavoris?: MetadonneesFavoris
  favorisOffres?: Offre[]
}
export type FicheBeneficiaireProps = BaseFiche &
  (FicheMiloProps | FichePasMiloProps)

export function estFicheMilo(
  props: FicheBeneficiaireProps
): props is FicheMiloProps {
  return props.estMilo
}

// Milo
export const valeursOngletsMilo = [
  'agenda',
  'actions',
  'rdvs',
  'offres',
  'favoris',
]
export type OngletMilo = (typeof valeursOngletsMilo)[number]
type DonneesMilo = {
  rdvs: EvenementListItem[]
  categoriesActions: SituationNonProfessionnelle[]
  erreurSessions?: boolean
}
export type FicheMiloProps = BaseFiche &
  DonneesMilo & { ongletInitial: OngletMilo }

// Pas Milo
export const valeursOngletsPasMilo = [
  'demarches',
  'offres',
  'recherches',
  'favoris',
]
export type OngletPasMilo = (typeof valeursOngletsPasMilo)[number]
type DonneesPasMilo = {
  favorisRecherches?: Recherche[]
  demarches?: { data: Demarche[]; isStale: boolean } | null
}
export type FichePasMiloProps = BaseFiche &
  DonneesPasMilo & { ongletInitial: OngletPasMilo }

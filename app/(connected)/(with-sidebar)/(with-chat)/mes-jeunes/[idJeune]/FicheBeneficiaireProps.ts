import { SituationNonProfessionnelle } from 'interfaces/action'
import {
  ConseillerHistorique,
  Demarche,
  DetailBeneficiaire,
  MetadonneesFavoris,
} from 'interfaces/beneficiaire'
import { EvenementListItem } from 'interfaces/evenement'
import { Offre } from 'interfaces/favoris'

export type Onglet = OngletMilo | OngletPasMilo
export type BaseFiche = {
  estMilo: boolean
  beneficiaire: DetailBeneficiaire
  historiqueConseillers: ConseillerHistorique[]
  debutSemaineInitiale?: string
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
export type FicheMiloProps = BaseFiche & {
  ongletInitial: OngletMilo
  rdvs: EvenementListItem[]
  categoriesActions: SituationNonProfessionnelle[]
  erreurSessions?: boolean
}

// Pas Milo
export const valeursOngletsPasMilo = [
  'demarches',
  'offres',
  'recherches',
  'favoris',
]
export type OngletPasMilo = (typeof valeursOngletsPasMilo)[number]
export type FichePasMiloProps = BaseFiche & {
  ongletInitial: OngletPasMilo
  demarches?: { data: Demarche[]; isStale: boolean } | null
}

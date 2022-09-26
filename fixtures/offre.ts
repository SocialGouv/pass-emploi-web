import { DetailOffreEmploiJson } from 'interfaces/json/offre'
import { BaseOffreEmploi, DetailOffreEmploi } from 'interfaces/offre-emploi'

export function unDetailOffre(
  overrides: Partial<DetailOffreEmploi> = {}
): DetailOffreEmploi {
  const defaults: DetailOffreEmploi = {
    id: 'id-offre',
    titre: "Offre d'emploi",
    urlPostulation: 'https://www.offres-emploi.fr/id-offre',
  }
  return { ...defaults, ...overrides }
}

export function listeBaseOffres(): BaseOffreEmploi[] {
  return [
    { id: '7158498', titre: 'F/H Comptable auxiliaire (H/F)' },
    { id: '7157716', titre: 'Contrôleur de Gestion H/F' },
    { id: '137FPBC', titre: 'Serveur / Serveuse de bar-brasserie' },
  ]
}

export function unDetailOffreJson(
  overrides: Partial<DetailOffreEmploiJson> = {}
): DetailOffreEmploiJson {
  const defaults: DetailOffreEmploiJson = {
    id: 'id-offre',
    data: { intitule: "Offre d'emploi" },
    urlRedirectPourPostulation: 'https://www.offres-emploi.fr/id-offre',
  }
  return { ...defaults, ...overrides }
}

import { DetailOffreEmploiJson } from 'interfaces/json/offre'
import { BaseOffreEmploi, DetailOffreEmploi } from 'interfaces/offre-emploi'

export function unDetailOffre(
  overrides: Partial<DetailOffreEmploi> = {}
): DetailOffreEmploi {
  const defaults: DetailOffreEmploi = {
    id: 'id-offre',
    titre: "Offre d'emploi",
    nomEntreprise: 'Entreprise 0',
    localisation: {
      nom: 'Adresse 0',
    },
    typeContrat: 'CDI',
    duree: 'Temps plein',
    urlPostulation: 'https://www.offres-emploi.fr/id-offre',
  }
  return { ...defaults, ...overrides }
}

export function listeBaseOffres(): BaseOffreEmploi[] {
  return [
    {
      id: '7158498',
      titre: 'F/H Comptable auxiliaire (H/F)',
      nomEntreprise: 'Entreprise 1',
      localisation: {
        nom: 'Adresse 1',
      },
      typeContrat: 'CDI 1',
      duree: 'Temps plein 1',
    },
    {
      id: '7157716',
      titre: 'Contrôleur de Gestion H/F',
      nomEntreprise: 'Entreprise 2',
      localisation: {
        nom: 'Adresse 2',
      },
      typeContrat: 'CD 2',
      duree: 'Temps plein 2',
    },
    {
      id: '137FPBC',
      titre: 'Serveur / Serveuse de bar-brasserie',
      nomEntreprise: 'Entreprise 3',
      localisation: {
        nom: 'Adresse 3',
      },
      typeContrat: 'CDI 3',
      duree: 'Temps plein 3',
    },
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

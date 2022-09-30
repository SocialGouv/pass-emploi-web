import {
  DetailOffreEmploiJson,
  OffreEmploiItemJson,
} from 'interfaces/json/offre'
import { BaseOffreEmploi, DetailOffreEmploi } from 'interfaces/offre-emploi'

export function unDetailOffre(
  overrides: Partial<DetailOffreEmploi> = {}
): DetailOffreEmploi {
  const defaults: DetailOffreEmploi = {
    id: 'id-offre',
    titre: "Offre d'emploi",
    nomEntreprise: 'Mon Entreprise',
    typeContrat: 'CDI',
    duree: 'Temps plein',
    localisation: 'Paris',
    urlPostulation: 'https://www.offres-emploi.fr/id-offre',
    dateActualisation: '2022-09-30T07:47:25.000Z',
    salaire: 'Selon profil',
    horaires: '24H Horaires normaux',
    description: 'une descrption d’offre d’emploi',
  }
  return { ...defaults, ...overrides }
}

export function listeBaseOffres(): BaseOffreEmploi[] {
  return [
    {
      id: '7158498',
      titre: 'F/H Comptable auxiliaire (H/F)',
      nomEntreprise: 'Entreprise',
      localisation: 'Adresse',
      typeContrat: 'CDI',
      duree: 'Temps plein',
    },
    {
      id: '7157716',
      titre: 'Contrôleur de Gestion H/F',
      nomEntreprise: 'Entreprise',
      localisation: 'Adresse',
      typeContrat: 'CDD',
      duree: 'Temps plein',
    },
    {
      id: '137FPBC',
      titre: 'Serveur / Serveuse de bar-brasserie',
      nomEntreprise: 'Entreprise',
      localisation: 'Adresse',
      typeContrat: 'CDI',
      duree: 'Temps plein',
    },
  ]
}

export function listeOffresJson(): OffreEmploiItemJson[] {
  return [
    {
      id: '7158498',
      titre: 'F/H Comptable auxiliaire (H/F)',
      nomEntreprise: 'Entreprise',
      localisation: { nom: 'Adresse' },
      typeContrat: 'CDI',
      duree: 'Temps plein',
    },
    {
      id: '7157716',
      titre: 'Contrôleur de Gestion H/F',
      nomEntreprise: 'Entreprise',
      localisation: { nom: 'Adresse' },
      typeContrat: 'CDD',
      duree: 'Temps plein',
    },
    {
      id: '137FPBC',
      titre: 'Serveur / Serveuse de bar-brasserie',
      nomEntreprise: 'Entreprise',
      localisation: { nom: 'Adresse' },
      typeContrat: 'CDI',
      duree: 'Temps plein',
    },
  ]
}

export function unDetailOffreJson(
  overrides: Partial<DetailOffreEmploiJson> = {}
): DetailOffreEmploiJson {
  const defaults: DetailOffreEmploiJson = {
    id: 'id-offre',
    data: {
      intitule: "Offre d'emploi",
      entreprise: { nom: 'Mon Entreprise' },
      typeContrat: 'CDI',
      lieuTravail: { libelle: 'Paris' },
      dureeTravailLibelleConverti: 'Temps plein',
      dateActualisation: '2022-09-30T07:47:25.000Z',
      salaire: { commentaire: 'Selon profil' },
      dureeTravailLibelle: '24H Horaires normaux',
      description: 'une descrption d’offre d’emploi',
    },
    urlRedirectPourPostulation: 'https://www.offres-emploi.fr/id-offre',
  }
  return { ...defaults, ...overrides }
}

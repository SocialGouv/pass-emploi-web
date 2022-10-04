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
    urlPostulation: 'https://www.offres-emploi.fr/id-offre',
    nomEntreprise: 'Mon Entreprise',
    typeContrat: 'CDI',
    typeContratLibelle: 'Contrat à durée déterminée - 10 Mois',
    duree: 'Temps plein',
    localisation: 'Paris',
    dateActualisation: '2022-09-30T07:47:25.000Z',
    salaire: 'Selon profil',
    horaires: '24H Horaires normaux',
    description: 'une description d’offre d’emploi',
    experience: {
      libelle: '1 an - en formation continue ou initiale',
      exigee: true,
    },
    competences: ['compétence 1', 'compétence 2'],
    competencesProfessionnelles: ['compétence pro 1', 'compétence pro 2'],
    formations: [
      'formation 1',
      'formation 1 : bac +3',
      'formation 1 : bac +3 (informatique)',
      'bac +3 (informatique)',
      'informatique',
      'formation 1 (informatique)',
    ],
    langues: ['langue 1'],
    permis: ['permis 1'],
    infoEntreprise: {
      detail: "Description longue de l'entreprise",
      lien: 'perdu.com',
      adaptee: false,
      accessibleTH: true,
    },
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
      entreprise: {
        nom: 'Mon Entreprise',
        description: "Description longue de l'entreprise",
        url: 'perdu.com',
        entrepriseAdaptee: false,
      },
      typeContrat: 'CDI',
      typeContratLibelle: 'Contrat à durée déterminée - 10 Mois',
      lieuTravail: { libelle: 'Paris' },
      dureeTravailLibelleConverti: 'Temps plein',
      dateActualisation: '2022-09-30T07:47:25.000Z',
      salaire: { libelle: 'Selon profil' },
      dureeTravailLibelle: '24H Horaires normaux',
      description: 'une description d’offre d’emploi',
      experienceLibelle: '1 an - en formation continue ou initiale',
      experienceExige: 'E',
      competences: [{ libelle: 'compétence 1' }, { libelle: 'compétence 2' }],
      qualitesProfessionnelles: [
        { libelle: 'compétence pro 1' },
        { libelle: 'compétence pro 2' },
      ],
      formations: [
        {
          commentaire: 'formation 1',
        },
        {
          commentaire: 'formation 1',
          niveauLibelle: 'bac +3',
        },
        {
          commentaire: 'formation 1',
          niveauLibelle: 'bac +3',
          domaineLibelle: 'informatique',
        },
        {
          niveauLibelle: 'bac +3',
          domaineLibelle: 'informatique',
        },
        {
          domaineLibelle: 'informatique',
        },
        {
          commentaire: 'formation 1',
          domaineLibelle: 'informatique',
        },
      ],
      langues: [{ libelle: 'langue 1' }],
      permis: [{ libelle: 'permis 1' }],
      accessibleTH: true,
    },
    urlRedirectPourPostulation: 'https://www.offres-emploi.fr/id-offre',
  }
  return { ...defaults, ...overrides }
}

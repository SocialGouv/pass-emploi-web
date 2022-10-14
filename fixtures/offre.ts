import { DateTime } from 'luxon'

import {
  DetailOffreEmploiJson,
  OffreEmploiItemJson,
} from 'interfaces/json/offre-emploi'
import { ServiceCiviqueItemJson } from 'interfaces/json/service-civique'
import {
  BaseOffreEmploi,
  BaseServiceCivique,
  DetailOffreEmploi,
  TypeOffre,
} from 'interfaces/offre'

export function unDetailOffreEmploi(
  overrides: Partial<DetailOffreEmploi> = {}
): DetailOffreEmploi {
  const defaults: DetailOffreEmploi = {
    type: TypeOffre.EMPLOI,
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

export function listeBaseOffresEmploi(): BaseOffreEmploi[] {
  return [
    {
      type: TypeOffre.EMPLOI,
      id: '7158498',
      titre: 'F/H Comptable auxiliaire (H/F)',
      nomEntreprise: 'Entreprise',
      localisation: 'Adresse',
      typeContrat: 'CDI',
      duree: 'Temps plein',
    },
    {
      type: TypeOffre.EMPLOI,
      id: '7157716',
      titre: 'Contrôleur de Gestion H/F',
      nomEntreprise: 'Entreprise',
      localisation: 'Adresse',
      typeContrat: 'CDD',
      duree: 'Temps plein',
    },
    {
      type: TypeOffre.EMPLOI,
      id: '137FPBC',
      titre: 'Serveur / Serveuse de bar-brasserie',
      nomEntreprise: 'Entreprise',
      localisation: 'Adresse',
      typeContrat: 'CDI',
      duree: 'Temps plein',
    },
  ]
}

export function listeOffresEmploiJson(): OffreEmploiItemJson[] {
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
      dateCreation: '2022-09-30T07:47:25.000Z',
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

export function listeBaseServicesCiviques(): BaseServiceCivique[] {
  return [
    {
      type: TypeOffre.SERVICE_CIVIQUE,
      id: '6322ac0fe8f66b05ee325ece',
      titre:
        'Participer aux dispositifs éducatifs au sein de la Cité éducative des portes du 20ème',
      organisation: "Ligue de l'enseignement fédération de Paris",
      ville: 'Paris',
      domaine: 'education',
      dateDeDebut: DateTime.fromISO('2022-11-01T00:00:00.000Z'),
    },
    {
      type: TypeOffre.SERVICE_CIVIQUE,
      id: '6322ac11e8f66b05ee325f10',
      titre:
        "Soutenir le développement, l'accès et la promotion de la pratique sportive",
      organisation: 'FEDERATION FRANCAISE DES CLUBS OMNISPORTS',
      ville: 'Massy',
      domaine: 'sport',
      dateDeDebut: DateTime.fromISO('2022-09-26T00:00:00.000Z'),
    },
    {
      type: TypeOffre.SERVICE_CIVIQUE,
      id: '6322ac12e8f66b05ee325f1d',
      titre:
        "Participer à la réussite en milieu scolaire à l'école française de Bonn (All.)",
      organisation: 'Ecole française de Gaulle-Adenauer',
      ville: 'Köln',
      domaine: 'education',
      dateDeDebut: DateTime.fromISO('2022-10-03T00:00:00.000Z'),
    },
  ]
}

export function listeServicesCiviquesJson(): ServiceCiviqueItemJson[] {
  return [
    {
      id: '6322ac0fe8f66b05ee325ece',
      titre:
        'Participer aux dispositifs éducatifs au sein de la Cité éducative des portes du 20ème',
      organisation: "Ligue de l'enseignement fédération de Paris",
      ville: 'Paris',
      domaine: 'education',
      dateDeDebut: '2022-11-01T00:00:00.000Z',
    },
    {
      id: '6322ac11e8f66b05ee325f10',
      titre:
        "Soutenir le développement, l'accès et la promotion de la pratique sportive",
      organisation: 'FEDERATION FRANCAISE DES CLUBS OMNISPORTS',
      ville: 'Massy',
      domaine: 'sport',
      dateDeDebut: '2022-09-26T00:00:00.000Z',
    },
    {
      id: '6322ac12e8f66b05ee325f1d',
      titre:
        "Participer à la réussite en milieu scolaire à l'école française de Bonn (All.)",
      organisation: 'Ecole française de Gaulle-Adenauer',
      ville: 'Köln',
      domaine: 'education',
      dateDeDebut: '2022-10-03T00:00:00.000Z',
    },
  ]
}

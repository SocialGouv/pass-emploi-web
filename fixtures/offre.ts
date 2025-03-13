import {
  DetailImmersionJson,
  ImmersionItemJson,
} from 'interfaces/json/immersion'
import {
  DataDetailOffreEmploiJson,
  DetailOffreEmploiJson,
  OffreEmploiItemJson,
} from 'interfaces/json/offre-emploi'
import { ServiceCiviqueItemJson } from 'interfaces/json/service-civique'
import {
  BaseImmersion,
  BaseOffreEmploi,
  BaseServiceCivique,
  DetailImmersion,
  DetailOffreEmploi,
  DetailServiceCivique,
  TypeOffre,
} from 'interfaces/offre'

export function uneBaseOffreEmploi(
  overrides: Partial<BaseOffreEmploi> = {}
): BaseOffreEmploi {
  const defaults: BaseOffreEmploi = {
    type: TypeOffre.EMPLOI,
    id: '142NCPN',
    titre: 'Conducteur de ligne automatisée chaussures de sport  (H/F)',
    typeContrat: 'CDI',
    duree: 'Temps plein',
    nomEntreprise: 'ADVANCED SHOE FACTORY 4.0',
    localisation: '07 - ARDOIX',
  }
  return { ...defaults, ...overrides }
}

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
    origine: { nom: 'Source offre', logo: 'https://www.perdu.com/logo.png' },
  }
  return { ...defaults, ...overrides }
}

export function unDetailOffreJson(
  overrides: Partial<DataDetailOffreEmploiJson> = {}
): DetailOffreEmploiJson {
  const defaults: DataDetailOffreEmploiJson = {
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
  }

  return {
    id: 'id-offre',
    urlRedirectPourPostulation: 'https://www.offres-emploi.fr/id-offre',
    data: { ...defaults, ...overrides },
    origine: {
      logo: 'https://www.perdu.com/logo.png',
      nom: 'Source offre',
    },
  }
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
    {
      type: TypeOffre.EMPLOI,
      id: '7495640',
      titre: 'Mécanicien automobile (H/F)',
      nomEntreprise: 'Entreprise',
      localisation: 'Adresse',
      typeContrat: 'Interim',
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
    {
      id: '7495640',
      titre: 'Mécanicien automobile (H/F)',
      nomEntreprise: 'Entreprise',
      localisation: { nom: 'Adresse' },
      typeContrat: 'MIS',
      duree: 'Temps plein',
    },
  ]
}

export function uneBaseAlternance(
  overrides: Partial<BaseOffreEmploi> = {}
): BaseOffreEmploi {
  const defaults: BaseOffreEmploi = {
    type: TypeOffre.ALTERNANCE,
    id: '142XDSV',
    titre: 'Apprentissage vente en boulangerie - pâtisserie (H/F)',
    typeContrat: 'CDD',
    duree: 'Temps plein',
    nomEntreprise: 'ICFA/LE FOURNIL DU PAQUEBOT',
    localisation: '44 - ST NAZAIRE',
  }
  return { ...defaults, ...overrides }
}

export function listeBaseAlternances(): BaseOffreEmploi[] {
  return [
    {
      type: TypeOffre.ALTERNANCE,
      id: '142XDVV',
      titre: 'Canalisateur H/F',
      typeContrat: 'CDD',
      duree: 'Temps plein',
      nomEntreprise: 'Canal+',
      localisation: '82 - GRISOLLES',
    },
    {
      type: TypeOffre.ALTERNANCE,
      id: '142XDSV',
      titre: 'Apprentissage vente en boulangerie - pâtisserie (H/F)',
      typeContrat: 'CDD',
      duree: 'Temps plein',
      nomEntreprise: 'ICFA/LE FOURNIL DU PAQUEBOT',
      localisation: '44 - ST NAZAIRE',
    },
    {
      type: TypeOffre.ALTERNANCE,
      id: '142XDMM',
      titre: 'Vendeur(se) Conseil en Magasin Toulon (H/F)',
      typeContrat: 'CDD',
      duree: 'Temps plein',
      nomEntreprise: 'Magasin Toulon',
      localisation: '83 - TOULON',
    },
  ]
}

export function listeAlternancesJson(): OffreEmploiItemJson[] {
  return [
    {
      id: '142XDVV',
      titre: 'Canalisateur H/F',
      typeContrat: 'CDD',
      duree: 'Temps plein',
      nomEntreprise: 'Canal+',
      localisation: {
        nom: '82 - GRISOLLES',
      },
      alternance: true,
    },
    {
      id: '142XDSV',
      titre: 'Apprentissage vente en boulangerie - pâtisserie (H/F)',
      typeContrat: 'CDD',
      duree: 'Temps plein',
      nomEntreprise: 'ICFA/LE FOURNIL DU PAQUEBOT',
      localisation: {
        nom: '44 - ST NAZAIRE',
      },
      alternance: true,
    },
    {
      id: '142XDMM',
      titre: 'Vendeur(se) Conseil en Magasin Toulon (H/F)',
      typeContrat: 'CDD',
      duree: 'Temps plein',
      nomEntreprise: 'Magasin Toulon',
      localisation: {
        nom: '83 - TOULON',
      },
      alternance: true,
    },
  ]
}

export function uneBaseServiceCivique(
  overrides: Partial<BaseServiceCivique> = {}
): BaseServiceCivique {
  const defaults: BaseServiceCivique = {
    type: TypeOffre.SERVICE_CIVIQUE,
    id: '631982fb221f8f05f031d6aa',
    titre: 'ANIMATIONS COLLECTIVES ET ACCOMPAGNEMENT DES SENIORS',
    organisation: 'Unis-Cité Vendée',
    ville: 'La Roche-sur-Yon',
    domaine: 'solidarite-insertion',
    dateDeDebut: '2022-10-17T00:00:00.000Z',
  }
  return { ...defaults, ...overrides }
}

export const unDetailServiceCivique = (): DetailServiceCivique => ({
  type: TypeOffre.SERVICE_CIVIQUE,
  id: 'unId',
  titre: 'unTitre',
  domaine: 'Informatique',
  ville: 'paris',
  organisation: 'Mon organisation',
  dateDeDebut: '2022-02-17T10:00:00.000Z',
  dateDeFin: '2022-07-17T10:00:00.000Z',
  lienAnnonce: 'lienoffre.com',
  description: 'offre très intéressante',
  urlOrganisation: 'lienorganisation.com',
  descriptionOrganisation: 'description',
  adresseMission: 'adresse mission',
  adresseOrganisation: 'adresse organistation',
  codeDepartement: '75',
  codePostal: '75018',
})

export function unServiceCiviqueJson(): ServiceCiviqueItemJson {
  return {
    id: '6322ac0fe8f66b05ee325ece',
    titre:
      'Participer aux dispositifs éducatifs au sein de la Cité éducative des portes du 20ème',
    organisation: "Ligue de l'enseignement fédération de Paris",
    ville: 'Paris',
    domaine: 'education',
    dateDeDebut: '2022-11-01T00:00:00.000Z',
  }
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
      dateDeDebut: '2022-11-01T00:00:00.000Z',
    },
    {
      type: TypeOffre.SERVICE_CIVIQUE,
      id: '6322ac11e8f66b05ee325f10',
      titre:
        "Soutenir le développement, l'accès et la promotion de la pratique sportive",
      organisation: 'FEDERATION FRANCAISE DES CLUBS OMNISPORTS',
      ville: 'Massy',
      domaine: 'sport',
      dateDeDebut: '2022-09-26T00:00:00.000Z',
    },
    {
      type: TypeOffre.SERVICE_CIVIQUE,
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

export function listeServicesCiviquesJson(): ServiceCiviqueItemJson[] {
  return [
    unServiceCiviqueJson(),
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

export function unDetailImmersion(
  overrides: Partial<DetailImmersion> = {}
): DetailImmersion {
  const defaults: DetailImmersion = {
    type: TypeOffre.IMMERSION,
    id: '89081896600016-M1805',
    titre: 'Études et développement informatique',
    nomEtablissement: 'MADO XR',
    secteurActivite:
      'Production de films cinématographiques, de vidéo et de programmes de télévision',
    ville: 'Paris',
    contact: {
      adresse: '33 Rue Claude Lorrain 75016 Paris',
    },
  }

  return { ...defaults, ...overrides }
}

export function unDetailImmersionJson(
  overrides: Partial<DetailImmersionJson> = {}
): DetailImmersionJson {
  const defaults: DetailImmersionJson = {
    id: '89081896600016-M1805',
    metier: 'Études et développement informatique',
    nomEtablissement: 'MADO XR',
    secteurActivite:
      'Production de films cinématographiques, de vidéo et de programmes de télévision',
    ville: 'Paris',
    adresse: '33 Rue Claude Lorrain 75016 Paris',
  }
  return { ...defaults, ...overrides }
}

export function uneBaseImmersion(
  overrides: Partial<BaseImmersion> = {}
): BaseImmersion {
  const defaults: BaseImmersion = {
    type: TypeOffre.IMMERSION,
    id: '89081896600016-M1805',
    titre: 'Études et développement informatique - MADO XR',
    nomEtablissement: 'MADO XR',
    secteurActivite:
      'Production de films cinématographiques, de vidéo et de programmes de télévision',
    ville: 'Paris',
  }
  return { ...defaults, ...overrides }
}

export function listeBaseImmersions({
  page,
}: {
  page?: number
} = {}): BaseImmersion[] {
  return [
    {
      type: TypeOffre.IMMERSION,
      id: '89081896600016-M1805' + (page ? '-page-' + page : ''),
      titre: 'Études et développement informatique - MADO XR',
      nomEtablissement: 'MADO XR',
      secteurActivite:
        'Production de films cinématographiques, de vidéo et de programmes de télévision',
      ville: 'Paris',
    },
    {
      type: TypeOffre.IMMERSION,
      id: '91401957500010-M1805' + (page ? '-page-' + page : ''),
      titre: 'Études et développement informatique - ESIFLY',
      nomEtablissement: 'ESIFLY',
      secteurActivite:
        'Autres activités spécialisées, scientifiques et techniques n.c.a.',
      ville: 'Paris',
    },
    {
      type: TypeOffre.IMMERSION,
      id: '88842904000015-M1805' + (page ? '-page-' + page : ''),
      titre: 'Études et développement informatique - AFNETWORK-FRANCE',
      nomEtablissement:
        'AFRICAN FILMMAKERS NETWORK ASSOCIATION - (AFNETWORK-FRANCE)',
      secteurActivite: 'Organisation de salons professionnels et congrès',
      ville: 'Paris',
    },
    {
      type: TypeOffre.IMMERSION,
      id: '82987789300026-M1805' + (page ? '-page-' + page : ''),
      titre: 'Études et développement informatique - EURONIXA',
      nomEtablissement: 'EURONIXA STUDIOS VR',
      secteurActivite:
        'Production de films cinématographiques, de vidéo et de programmes de télévision',
      ville: 'PARIS 8',
    },
    {
      type: TypeOffre.IMMERSION,
      id: '38953391000045-M1805' + (page ? '-page-' + page : ''),
      titre: 'Études et développement informatique - PARIS LOG',
      nomEtablissement: 'PARIS LOG',
      secteurActivite: 'Programmation informatique',
      ville: 'Torcy',
    },
  ]
}

export function listeImmersionsJson({
  page,
}: { page?: number } = {}): ImmersionItemJson[] {
  return [
    {
      id: '89081896600016-M1805' + (page ? '-page-' + page : ''),
      metier: 'Études et développement informatique - MADO XR',
      nomEtablissement: 'MADO XR',
      secteurActivite:
        'Production de films cinématographiques, de vidéo et de programmes de télévision',
      ville: 'Paris',
    },
    {
      id: '91401957500010-M1805' + (page ? '-page-' + page : ''),
      metier: 'Études et développement informatique - ESIFLY',
      nomEtablissement: 'ESIFLY',
      secteurActivite:
        'Autres activités spécialisées, scientifiques et techniques n.c.a.',
      ville: 'Paris',
    },
    {
      id: '88842904000015-M1805' + (page ? '-page-' + page : ''),
      metier: 'Études et développement informatique - AFNETWORK-FRANCE',
      nomEtablissement:
        'AFRICAN FILMMAKERS NETWORK ASSOCIATION - (AFNETWORK-FRANCE)',
      secteurActivite: 'Organisation de salons professionnels et congrès',
      ville: 'Paris',
    },
    {
      id: '82987789300026-M1805' + (page ? '-page-' + page : ''),
      metier: 'Études et développement informatique - EURONIXA',
      nomEtablissement: 'EURONIXA STUDIOS VR',
      secteurActivite:
        'Production de films cinématographiques, de vidéo et de programmes de télévision',
      ville: 'PARIS 8',
    },
    {
      id: '38953391000045-M1805' + (page ? '-page-' + page : ''),
      metier: 'Études et développement informatique - PARIS LOG',
      nomEtablissement: 'PARIS LOG',
      secteurActivite: 'Programmation informatique',
      ville: 'Torcy',
    },
  ]
}

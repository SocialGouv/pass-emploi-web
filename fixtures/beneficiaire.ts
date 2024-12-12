import { DateTime } from 'luxon'

import {
  BaseBeneficiaire,
  BeneficiaireAvecCompteursActionsRdvs,
  BeneficiaireEtChat,
  BeneficiaireFromListe,
  BeneficiaireWithActivity,
  CategorieSituation,
  Chat,
  ConseillerHistorique,
  Demarche,
  DetailBeneficiaire,
  IndicateursSemaine,
  MetadonneesFavoris,
} from 'interfaces/beneficiaire'
import {
  BaseBeneficiaireJson,
  DemarcheJson,
  DetailBeneficiaireJson,
  IndicateursSemaineJson,
  ItemBeneficiaireJson,
  MetadonneesFavorisJson,
  StatutDemarche,
} from 'interfaces/json/beneficiaire'
import { ConseillerHistoriqueJson } from 'interfaces/json/conseiller'

export const uneBaseBeneficiaire = (
  overrides: Partial<BaseBeneficiaire> = {}
): BaseBeneficiaire => {
  const defaults: BaseBeneficiaire = {
    id: 'beneficiaire-1',
    prenom: 'Kenji',
    nom: 'Jirac',
  }
  return { ...defaults, ...overrides }
}

export const unBeneficiaireWithActivity = (
  overrides: Partial<BeneficiaireWithActivity> = {}
): BeneficiaireWithActivity => {
  const defaults: BeneficiaireWithActivity = {
    ...uneBaseBeneficiaire(),
    estAArchiver: false,
  }
  return { ...defaults, ...overrides }
}

export const unDetailBeneficiaire = (
  overrides: Partial<DetailBeneficiaire> = {}
): DetailBeneficiaire => {
  const defaults: DetailBeneficiaire = {
    ...uneBaseBeneficiaire(),
    email: 'kenji.jirac@email.fr',
    isActivated: true,
    idPartenaire: '1234',
    isReaffectationTemporaire: false,
    creationDate: '2021-12-07T17:30:07.756Z',
    lastActivity: '2023-04-12T05:42:07.756Z',
    situations: [],
    idConseiller: 'id-conseiller',
    estAArchiver: false,
  }
  return { ...defaults, ...overrides }
}

export const uneMetadonneeFavoris = (
  overrides: Partial<MetadonneesFavoris> = {}
): MetadonneesFavoris => {
  const defaults: MetadonneesFavoris = {
    autoriseLePartage: true,
    offres: {
      total: 12,
      nombreOffresEmploi: 3,
      nombreOffresAlternance: 3,
      nombreOffresImmersion: 3,
      nombreOffresServiceCivique: 3,
    },
    recherches: {
      total: 8,
      nombreRecherchesOffresEmploi: 2,
      nombreRecherchesOffresAlternance: 4,
      nombreRecherchesOffresImmersion: 2,
      nombreRecherchesOffresServiceCivique: 2,
    },
  }
  return { ...defaults, ...overrides }
}

export const uneMetadonneeFavorisJson = (
  overrides: Partial<MetadonneesFavorisJson> = {}
): MetadonneesFavorisJson => {
  const defaults: MetadonneesFavorisJson = {
    autoriseLePartage: true,
    offres: {
      total: 12,
      nombreOffresEmploi: 3,
      nombreOffresAlternance: 3,
      nombreOffresImmersion: 3,
      nombreOffresServiceCivique: 3,
    },
    recherches: {
      total: 8,
      nombreRecherchesOffresEmploi: 2,
      nombreRecherchesOffresAlternance: 4,
      nombreRecherchesOffresImmersion: 2,
      nombreRecherchesOffresServiceCivique: 2,
    },
  }
  return { ...defaults, ...overrides }
}

export const unItemBeneficiaire = (
  overrides: Partial<BeneficiaireFromListe> = {}
): BeneficiaireFromListe => {
  const defaults: BeneficiaireFromListe = {
    ...unBeneficiaireWithActivity({ lastActivity: '2021-12-07T17:30:07.756Z' }),
    isActivated: true,
    isReaffectationTemporaire: false,
    situationCourante: CategorieSituation.SANS_SITUATION,
  }
  return { ...defaults, ...overrides }
}

export const desItemsBeneficiaires = (): BeneficiaireFromListe[] => [
  unItemBeneficiaire(),
  unItemBeneficiaire({
    id: 'beneficiaire-2',
    prenom: 'Nadia',
    nom: 'Sanfamiye',
    lastActivity: '2022-01-30T17:30:07.756Z',
    isActivated: true,
  }),
  unItemBeneficiaire({
    id: 'beneficiaire-3',
    prenom: 'Maria',
    nom: "D'Aböville-Muñoz François",
    lastActivity: '2022-02-07T17:30:07.756Z',
    isActivated: true,
    dateFinCEJ: '2022-06-11T00:00:00.000+00:00',
  }),
]

export const uneBaseBeneficiaireJson = (
  overrides: Partial<BaseBeneficiaireJson> = {}
): BaseBeneficiaireJson => {
  const defaults: BaseBeneficiaireJson = {
    id: 'beneficiaire-1',
    firstName: 'Kenji',
    lastName: 'Jirac',
  }
  return { ...defaults, ...overrides }
}

export const unDetailBeneficiaireJson = (
  overrides: Partial<DetailBeneficiaireJson> = {}
): DetailBeneficiaireJson => {
  const defaults: DetailBeneficiaireJson = {
    id: 'beneficiaire-1',
    firstName: 'Kenji',
    lastName: 'Jirac',
    email: 'kenji.jirac@email.fr',
    isActivated: true,
    idPartenaire: '1234',
    isReaffectationTemporaire: false,
    creationDate: '2021-12-07T17:30:07.756Z',
    lastActivity: '2023-04-12T05:42:07.756Z',
    conseiller: { id: 'id-conseiller' },
  }
  return { ...defaults, ...overrides }
}

export const unItemBeneficiaireJson = (
  overrides: Partial<ItemBeneficiaireJson> = {}
): ItemBeneficiaireJson => {
  const defaults: ItemBeneficiaireJson = {
    id: 'beneficiaire-1',
    firstName: 'Kenji',
    lastName: 'Jirac',
    estAArchiver: false,
    isActivated: true,
    isReaffectationTemporaire: false,
    lastActivity: '2021-12-07T17:30:07.756Z',
  }
  return { ...defaults, ...overrides }
}

export const desItemsBeneficiairesJson = (): ItemBeneficiaireJson[] => [
  unItemBeneficiaireJson(),
  unItemBeneficiaireJson({
    id: 'beneficiaire-2',
    firstName: 'Nadia',
    lastName: 'Sanfamiye',
    lastActivity: '2022-01-30T17:30:07.756Z',
    isActivated: true,
  }),
  unItemBeneficiaireJson({
    id: 'beneficiaire-3',
    firstName: 'Maria',
    lastName: "D'Aböville-Muñoz François",
    lastActivity: '2022-02-07T17:30:07.756Z',
    isActivated: true,
    dateFinCEJ: '2022-06-11T00:00:00.000+00:00',
  }),
]

export const unBeneficiaireAvecActionsNonTerminees = (
  overrides: Partial<BeneficiaireAvecCompteursActionsRdvs> = {}
): BeneficiaireAvecCompteursActionsRdvs => {
  const defaults: BeneficiaireAvecCompteursActionsRdvs = {
    ...unItemBeneficiaire(),
    actionsCreees: 5,
    rdvs: 2,
  }
  return { ...defaults, ...overrides }
}

export const desBeneficiairesAvecActionsNonTerminees =
  (): BeneficiaireAvecCompteursActionsRdvs[] => [
    unBeneficiaireAvecActionsNonTerminees(),
    unBeneficiaireAvecActionsNonTerminees({
      id: 'beneficiaire-2',
      prenom: 'Nadia',
      nom: 'Sanfamiye',
      isActivated: false,
      lastActivity: '2022-01-30T17:30:07.756Z',
      actionsCreees: 0,
    }),
    unBeneficiaireAvecActionsNonTerminees({
      id: 'beneficiaire-3',
      prenom: 'Maria',
      nom: "D'Aböville-Muñoz François",
      lastActivity: '2022-02-07T17:30:07.756Z',
      isReaffectationTemporaire: true,
      actionsCreees: 8,
      dateFinCEJ: '2022-06-11T00:00:00.000+00:00',
    }),
  ]

export const unChat = (overrides: Partial<Chat> = {}): Chat => {
  const defaults: Chat = {
    chatId: 'chat-id',
    seenByConseiller: true,
    newConseillerMessageCount: 1,
    lastMessageContent: 'Test message',
    lastMessageSentAt: DateTime.now(),
    lastMessageSentBy: 'conseiller',
    lastConseillerReading: DateTime.now(),
    lastJeuneReading: undefined,
    lastMessageIv: undefined,
    flaggedByConseiller: true,
  }
  return { ...defaults, ...overrides }
}

export const unBeneficiaireChat = (
  overrides: Partial<BeneficiaireEtChat> = {}
): BeneficiaireEtChat => {
  const defaults: BeneficiaireEtChat = {
    id: 'beneficiaire-1',
    prenom: 'Kenji',
    nom: 'Jirac',
    ...unChat(),
    chatId: 'idChat',
  }
  return { ...defaults, ...overrides }
}

export const unConseillerHistorique = (
  overrides: Partial<ConseillerHistorique> = {}
): ConseillerHistorique => {
  const defaults: ConseillerHistorique = {
    id: 'conseiller-1',
    nom: 'Dublon',
    prenom: 'Nicolas',
    depuis: '12/03/2022',
  }
  return { ...defaults, ...overrides }
}

export const desConseillersBeneficiaire = (): ConseillerHistorique[] => [
  unConseillerHistorique(),
  unConseillerHistorique({
    id: 'conseiller-2',
    nom: 'Maravillo',
    prenom: 'Sarah',
    depuis: '2021-12-28T17:30:07.756Z',
  }),
  unConseillerHistorique({
    id: 'conseiller-3',
    nom: 'Hazard',
    prenom: 'Maurice',
    depuis: '2021-12-14T17:30:07.756Z',
  }),
  unConseillerHistorique({
    id: 'conseiller-4',
    nom: 'Sall',
    prenom: 'Ahmadi',
    depuis: '2021-02-16T17:30:07.756Z',
  }),
  unConseillerHistorique({
    id: 'conseiller-5',
    nom: 'Wonder',
    prenom: 'Mia',
    depuis: '2020-06-06T17:30:07.756Z',
  }),
  unConseillerHistorique({
    id: 'conseiller-6',
    nom: 'Lupin',
    prenom: 'Edgard',
    depuis: '2020-02-02T17:30:07.756Z',
  }),
]

export const desConseillersBeneficiaireJson =
  (): ConseillerHistoriqueJson[] => {
    return desConseillersBeneficiaire().map((conseiller) => ({
      id: conseiller.id,
      nom: conseiller.nom,
      prenom: conseiller.prenom,
      date: conseiller.depuis,
    }))
  }

export const desIndicateursSemaineJson = (
  overrides: Partial<IndicateursSemaineJson> = {}
): IndicateursSemaineJson => {
  const defaults: IndicateursSemaineJson = {
    actions: {
      creees: 0,
      enRetard: 2,
      terminees: 1,
      aEcheance: 3,
    },
    rendezVous: {
      planifies: 3,
    },
    offres: {
      consultees: 10,
      partagees: 4,
    },
    favoris: {
      offresSauvegardees: 6,
      recherchesSauvegardees: 7,
    },
  }
  return { ...defaults, ...overrides }
}

export const desIndicateursSemaine = (
  overrides: Partial<IndicateursSemaine> = {}
): IndicateursSemaine => {
  const defaults: IndicateursSemaine = {
    actions: {
      creees: 0,
      enRetard: 2,
      terminees: 1,
      aEcheance: 3,
    },
    rendezVous: 3,
    offres: {
      consultees: 10,
      partagees: 4,
    },
    favoris: {
      offresSauvegardees: 6,
      recherchesSauvegardees: 7,
    },
  }
  return { ...defaults, ...overrides }
}

export const uneDemarche = (overrides: Partial<Demarche> = {}): Demarche => {
  const defaults: Demarche = {
    id: 'id-demarche',
    label: 'Mes candidatures',
    statut: StatutDemarche.EN_COURS,
    dateCreation: '2024-09-23T17:30:07.756Z',
    dateFin: '2024-09-30T17:30:07.756Z',
    titre: 'Réalisation d’entretiens d’embauche',
    sousTitre: 'Par internet',
  }
  return { ...defaults, ...overrides }
}

export const uneListeDeDemarches = (): Demarche[] => {
  return [
    uneDemarche(),
    uneDemarche({
      id: 'id-demarche-2',
      titre: 'Démarche personnalisée',
      statut: StatutDemarche.A_FAIRE,
    }),
  ]
}

export const uneDemarcheJson = (
  overrides: Partial<DemarcheJson> = {}
): DemarcheJson => {
  const defaults: DemarcheJson = {
    id: 'id-demarche',
    label: 'Mes candidatures',
    statut: StatutDemarche.EN_COURS,
    dateCreation: '2024-09-23T17:30:07.756Z',
    dateFin: '2024-09-30T17:30:07.756Z',
    titre: 'Réalisation d’entretiens d’embauche',
    sousTitre: 'Par internet',
    attributs: [{ cle: 'metier', valeur: 'Boulanger' }],
  }
  return { ...defaults, ...overrides }
}

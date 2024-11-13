import {
  Action,
  ActionPilotage,
  ActionPredefinie,
  SituationNonProfessionnelle,
  StatutAction,
} from 'interfaces/action'
import { ActionJson, ActionPilotageJson } from 'interfaces/json/action'
import { MetadonneesPagination } from 'types/pagination'

export const uneAction = (overrides: Partial<Action> = {}): Action => {
  const defaults: Action = {
    id: 'id-action-1',
    titre: 'Identifier ses atouts et ses compétences',
    comment: 'Je suis un beau commentaire',
    creationDate: '2022-02-15T15:50:46.000+01:00',
    lastUpdate: '2022-02-16T15:50:46.000+01:00',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: StatutAction.AFaire,
    dateEcheance: '2022-02-20T14:50:46.000Z',
  }

  return { ...defaults, ...overrides }
}

export const uneListeDActions = (): Action[] => [
  uneAction(),
  {
    id: 'id-action-2',
    titre: 'Compléter son cv',
    comment: 'Je suis un beau commentaire',
    creationDate: '2022-02-17T15:50:46.000+01:00',
    lastUpdate: '2022-02-18T15:50:46.000+01:00',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: StatutAction.AFaire,
    dateEcheance: '2022-02-20T14:50:46.000Z',
  },
  {
    id: 'id-action-3',
    titre: 'Chercher une formation',
    comment: 'Je suis un beau commentaire',
    creationDate: '2022-02-19T15:50:46.000+01:00',
    lastUpdate: '2022-02-20T15:50:46.000+01:00',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: StatutAction.Terminee,
    dateEcheance: '2022-02-21T14:50:46.000Z',
    dateFinReelle: '2022-02-20T14:50:46.000Z',
  },
  {
    id: 'id-action-4',
    titre: "Consulter les offres d'emploi",
    comment: 'Je suis un beau commentaire',
    creationDate: '2022-02-21T15:50:46.000+01:00',
    lastUpdate: '2022-03-22T15:50:46.000+01:00',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: StatutAction.Terminee,
    dateEcheance: '2022-02-22T14:50:46.000Z',
    dateFinReelle: '2022-03-22T14:50:46.000Z',
    qualification: {
      libelle: 'Non SNP',
      code: 'NON_SNP',
      isSituationNonProfessionnelle: false,
    },
  },
]

export const uneActionJson = (
  overrides: Partial<ActionJson> = {}
): ActionJson => {
  const defaults: ActionJson = {
    id: 'id-action-1',
    content: 'Identifier ses atouts et ses compétences',
    comment: 'Je suis un beau commentaire',
    creationDate: 'Tue, 15 Feb 2022 14:50:46 UTC',
    lastUpdate: 'Wed, 16 Feb 2022 14:50:46 UTC',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: 'not_started',
    dateEcheance: '2022-02-20T14:50:46.000Z',
  }

  return { ...defaults, ...overrides }
}

export const uneListeDActionsAQualifier = (): ActionPilotage[] => {
  return [
    {
      id: '009347ea-4acb-4b61-9e08-b6caf38e28fe',
      titre: 'Faire du polynectar',
      beneficiaire: {
        id: 'hermione',
        nom: 'Granger',
        prenom: 'Hermione',
      },
      dateFinReelle: '2022-12-18T14:03:56.395Z',
      categorie: {
        code: 'EMPLOI',
        libelle: 'Emploi',
      },
    },
    {
      id: '04816605-60a7-4666-9dc5-607d71a570ff',
      titre: 'Identifier des pistes de métier',
      beneficiaire: {
        id: 'FFSYH',
        nom: 'Fury',
        prenom: 'Bryan',
      },
      dateFinReelle: '2022-12-19T14:03:56.395Z',
      categorie: {
        code: 'SPORTS_CULTURE_LOISIR',
        libelle: 'Sports,culture,loisir',
      },
    },
    {
      id: 'a9ced2e0-314d-47a2-8275-0502e48dde57',
      titre: 'Mettre à jour le CV',
      beneficiaire: {
        id: 'FFSYH',
        nom: 'Tran',
        prenom: 'Mélodie',
      },
      dateFinReelle: '2023-01-10T15:26:00.055Z',
      categorie: {
        code: 'FORMATION',
        libelle: 'Formation',
      },
    },
    {
      id: '3f09f448-c2db-4129-92ee-2349177bec52',
      titre: 'Identifier des entreprises',
      beneficiaire: {
        id: 'CMVJL',
        nom: 'Caramelle',
        prenom: 'Amelle',
      },
      dateFinReelle: '2023-01-30T15:12:20.342Z',
      categorie: {
        code: 'LOGEMENT',
        libelle: 'Logement',
      },
    },
    {
      id: '39095c2f-c4d9-4a8b-b6fe-9a0dc938442c',
      titre: 'Aller au forum le 08/12',
      beneficiaire: {
        id: 'ZKBAC',
        nom: 'Android',
        prenom: 'Gabriel',
      },
      dateFinReelle: '2023-01-31T15:12:20.342Z',
      categorie: {
        code: 'SANTE',
        libelle: 'Santé',
      },
    },
  ]
}

export const uneListeDActionsAQualifierJson = (): ActionPilotageJson[] => {
  return [
    {
      id: '009347ea-4acb-4b61-9e08-b6caf38e28fe',
      titre: 'Faire du polynectar',
      jeune: {
        id: 'hermione',
        nom: 'Granger',
        prenom: 'Hermione',
      },
      dateFinReelle: '2022-12-18T14:03:56.395Z',
      categorie: {
        code: 'EMPLOI',
        libelle: 'Emploi',
      },
    },
    {
      id: '04816605-60a7-4666-9dc5-607d71a570ff',
      titre: 'Identifier des pistes de métier',
      jeune: {
        id: 'FFSYH',
        nom: 'Fury',
        prenom: 'Bryan',
      },
      dateFinReelle: '2022-12-19T14:03:56.395Z',
      categorie: {
        code: 'SPORTS_CULTURE_LOISIR',
        libelle: 'Sports,culture,loisir',
      },
    },
    {
      id: 'a9ced2e0-314d-47a2-8275-0502e48dde57',
      titre: 'Mettre à jour le CV',
      jeune: {
        id: 'FFSYH',
        nom: 'Tran',
        prenom: 'Mélodie',
      },
      dateFinReelle: '2023-01-10T15:26:00.055Z',
      categorie: {
        code: 'FORMATION',
        libelle: 'Formation',
      },
    },
    {
      id: '3f09f448-c2db-4129-92ee-2349177bec52',
      titre: 'Identifier des entreprises',
      jeune: {
        id: 'CMVJL',
        nom: 'Caramelle',
        prenom: 'Amelle',
      },
      dateFinReelle: '2023-01-30T15:12:20.342Z',
      categorie: {
        code: 'LOGEMENT',
        libelle: 'Logement',
      },
    },
    {
      id: '39095c2f-c4d9-4a8b-b6fe-9a0dc938442c',
      titre: 'Aller au forum le 08/12',
      jeune: {
        id: 'ZKBAC',
        nom: 'Android',
        prenom: 'Gabriel',
      },
      dateFinReelle: '2023-01-31T15:12:20.342Z',
      categorie: {
        code: 'SANTE',
        libelle: 'Santé',
      },
    },
  ]
}

export const uneListeDActionsJson = (
  supplementaryActions: ActionJson[] = []
): ActionJson[] => [
  {
    id: 'id-action-1',
    content: 'Identifier ses atouts et ses compétences',
    comment: 'Je suis un beau commentaire',
    creationDate: 'Tue, 15 Feb 2022 14:50:46 UTC',
    lastUpdate: 'Wed, 16 Feb 2022 14:50:46 UTC',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: 'not_started',
    dateEcheance: '2022-02-20T14:50:46.000Z',
  },
  {
    id: 'id-action-2',
    content: 'Compléter son cv',
    comment: 'Je suis un beau commentaire',
    creationDate: 'Thu, 17 Feb 2022 14:50:46 UTC',
    lastUpdate: 'Fri, 18 Feb 2022 14:50:46 UTC',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: 'in_progress',
    dateEcheance: '2022-02-20T14:50:46.000Z',
  },
  {
    id: 'id-action-3',
    content: 'Chercher une formation',
    comment: 'Je suis un beau commentaire',
    creationDate: 'Sat, 19 Feb 2022 14:50:46 UTC',
    lastUpdate: 'Sun, 20 Feb 2022 14:50:46 UTC',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: 'done',
    dateEcheance: '2022-02-21T14:50:46.000Z',
    dateFinReelle: '2022-02-20T14:50:46.000Z',
  },
  {
    id: 'id-action-4',
    content: "Consulter les offres d'emploi",
    comment: 'Je suis un beau commentaire',
    creationDate: 'Mon, 21 Feb 2022 14:50:46 UTC',
    lastUpdate: 'Tue, 22 Mar 2022 14:50:46 UTC',
    creator: 'Nils',
    creatorType: 'conseiller',
    status: 'done',
    dateEcheance: '2022-02-22T14:50:46.000Z',
    dateFinReelle: '2022-03-22T14:50:46.000Z',
    qualification: {
      libelle: 'Non SNP',
      code: 'NON_SNP',
    },
  },
  ...supplementaryActions,
]

export const desActionsInitiales = (): {
  actions: Action[]
  metadonnees: MetadonneesPagination
  page: number
} => {
  return {
    actions: [],
    page: 0,
    metadonnees: { nombreTotal: 0, nombrePages: 0 },
  }
}

export const desCategories = (): SituationNonProfessionnelle[] => [
  { code: 'SNP_1', label: 'SNP 1' },
  { code: 'SNP_2', label: 'SNP 2' },
  { code: 'SNP_3', label: 'SNP 3' },
]

export const desCategoriesAvecNONSNP = (): SituationNonProfessionnelle[] => [
  { code: 'SNP_1', label: 'SNP 1' },
  { code: 'SNP_2', label: 'SNP 2' },
  { code: 'SNP_3', label: 'SNP 3' },
  { code: 'NON_SNP', label: 'NON_SNP' },
]

export const desActionsPredefinies = (): ActionPredefinie[] => [
  {
    id: 'action-predefinie-1',
    titre: 'Identifier ses atouts et ses compétences',
  },
  { id: 'action-predefinie-2', titre: 'Identifier des pistes de métier' },
  { id: 'action-predefinie-3', titre: 'Identifier des entreprises' },
]

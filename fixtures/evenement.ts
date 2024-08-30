import { DateTime } from 'luxon'

import { uneBaseBeneficiaire } from 'fixtures/beneficiaire'
import {
  AnimationCollective,
  AnimationCollectivePilotage,
  Evenement,
  EvenementListItem,
  StatutAnimationCollective,
} from 'interfaces/evenement'
import { EvenementJeuneJson, EvenementJson } from 'interfaces/json/evenement'
import { TypeEvenementReferentiel } from 'interfaces/referentiel'

export function typesEvenement(): TypeEvenementReferentiel[] {
  return [...typesEvenementCEJ(), ...typesAnimationCollective()]
}

export function typesAnimationCollective(): TypeEvenementReferentiel[] {
  return [
    {
      code: 'ATELIER',
      label: 'Atelier',
      categorie: 'CEJ_AC',
    },

    {
      code: 'INFORMATION_COLLECTIVE',
      label: 'Information collective',
      categorie: 'CEJ_AC',
    },
  ]
}

export function typesEvenementCEJ(): TypeEvenementReferentiel[] {
  return [
    {
      code: 'ACTIVITES_EXTERIEURES',
      label: 'Activités extérieures',
      categorie: 'CEJ_RDV',
    },
    {
      code: 'ENTRETIEN_INDIVIDUEL_CONSEILLER',
      label: 'Entretien individuel conseiller',
      categorie: 'CEJ_RDV',
    },
    {
      code: 'ENTRETIEN_PARTENAIRE',
      label: 'Entretien par un partenaire',
      categorie: 'CEJ_RDV',
    },
    {
      code: 'VISITE',
      label: 'Visite',
      categorie: 'CEJ_RDV',
    },
    {
      code: 'PRESTATION',
      label: 'Prestation',
      categorie: 'CEJ_RDV',
    },
    {
      code: 'AUTRE',
      label: 'Autre',
      categorie: 'CEJ_RDV',
    },
  ]
}

export function unEvenement(overrides: Partial<Evenement> = {}): Evenement {
  const defaults: Evenement = {
    id: '1',
    titre: 'Prise de nouvelles par téléphone',
    jeunes: [uneBaseBeneficiaire()],
    type: { code: 'AUTRE', label: 'Autre' },
    precisionType: 'Prise de nouvelles',
    modality: 'par téléphone',
    date: '2021-10-21T10:00:00.000Z',
    duree: 125,
    adresse: '36 rue de marseille, 93200 Saint-Denis',
    organisme: 'S.A.R.L',
    presenceConseiller: false,
    invitation: true,
    commentaire: 'Rendez-vous avec Kenji',
    createur: { id: '1', nom: 'Tavernier', prenom: 'Nils' },
    historique: [
      {
        date: '2021-10-23T10:00:00.000Z',
        auteur: { nom: 'Lama', prenom: 'Serge' },
      },
      {
        date: '2021-10-22T10:00:00.000Z',
        auteur: { nom: 'Lama', prenom: 'Serge' },
      },
      {
        date: '2021-10-21T10:00:00.000Z',
        auteur: { nom: 'Lama', prenom: 'Serge' },
      },
    ],
    source: 'PASS_EMPLOI',
  }

  return { ...defaults, ...overrides }
}

export function desEvenementsListItems(): EvenementListItem[] {
  return [
    unEvenementListItem({
      beneficiaires: [{ id: 'beneficiaire-1', nom: 'Jirac', prenom: 'Kenji' }],
    }),
    {
      id: '2',
      labelBeneficiaires: 'Jirac Raja',
      type: 'Atelier',
      modality: 'En agence',
      date: '2021-10-25T12:00:00.000Z',
      duree: 25,
      createur: {
        id: '2',
      },
      beneficiaires: [{ id: 'beneficiaire-2', nom: 'Trotro', prenom: 'L’âne' }],
      source: 'MILO',
    },
  ]
}

export function unEvenementListItem(
  overrides: Partial<EvenementListItem> = {}
): EvenementListItem {
  const defaults: EvenementListItem = {
    id: '1',
    labelBeneficiaires: 'Jirac Kenji',
    type: 'Autre',
    modality: 'par téléphone',
    date: '2021-10-21T10:00:00.000Z',
    duree: 125,
    createur: {
      id: '1',
      nom: 'Tavernier',
      prenom: 'Nils',
    },
    source: 'PASS_EMPLOI',
  }
  return { ...defaults, ...overrides }
}

export function uneAnimationCollective(
  overrides: Partial<AnimationCollective> = {}
): AnimationCollective {
  const defaults: AnimationCollective = {
    id: 'ac-1',
    type: 'Atelier',
    titre: 'Prise de nouvelles par téléphone',
    date: DateTime.fromISO('2021-10-21T10:00:00.000Z'),
    duree: 125,
    statut: StatutAnimationCollective.AVenir,
    nombreParticipants: 1,
    nombreMaxParticipants: 10,
  }
  return { ...defaults, ...overrides }
}

export const uneListeDAnimationCollectiveAClore =
  (): AnimationCollectivePilotage[] => {
    return [
      {
        id: '1',
        titre: 'titre 1',
        date: '2018-11-21T06:20:32.232Z',
        nombreInscrits: 3,
      },
      {
        id: '2',
        titre: 'titre 2',
        date: '2018-11-22T06:20:32.232Z',
        nombreInscrits: 12,
      },
      {
        id: '3',
        titre: 'titre 3',
        date: '2018-11-23T06:20:32.232Z',
        nombreInscrits: 5,
      },
      {
        id: '4',
        titre: 'titre 4',
        date: '2018-11-24T06:20:32.232Z',
        nombreInscrits: 7,
      },
      {
        id: '5',
        titre: 'titre 5',
        date: '2018-11-25T06:20:32.232Z',
        nombreInscrits: 9,
      },
    ]
  }

export function unEvenementJson(
  overrides: Partial<EvenementJson> = {}
): EvenementJson {
  const defaults: EvenementJson = {
    id: '1',
    jeunes: [
      {
        id: 'beneficiaire-1',
        prenom: 'Kenji',
        nom: 'Jirac',
      },
    ],
    nombreMaxParticipants: 10,
    type: { code: 'AUTRE', label: 'Autre' },
    title: 'Prise de nouvelles par téléphone',
    precision: 'Prise de nouvelles',
    modality: 'par téléphone',
    date: '2021-10-21T10:00:00.000Z',
    duration: 125,
    adresse: '36 rue de marseille, 93200 Saint-Denis',
    organisme: 'S.A.R.L',
    presenceConseiller: false,
    invitation: true,
    comment: 'Rendez-vous avec Kenji',
    createur: { id: '1', nom: 'Tavernier', prenom: 'Nils' },
    historique: [
      {
        date: '2021-10-23T10:00:00.000Z',
        auteur: { id: '2', nom: 'Lama', prenom: 'Serge' },
      },
      {
        date: '2021-10-22T10:00:00.000Z',
        auteur: { id: '2', nom: 'Lama', prenom: 'Serge' },
      },
      {
        date: '2021-10-21T10:00:00.000Z',
        auteur: { id: '2', nom: 'Lama', prenom: 'Serge' },
      },
    ],
    source: 'PASS_EMPLOI',
  }

  return { ...defaults, ...overrides }
}

export function uneListeDEvenementJson() {
  return [
    unEvenementJson(),
    unEvenementJson({
      jeunes: [
        {
          id: '1',
          prenom: 'Kenji',
          nom: 'Jirac',
        },
        {
          id: '2',
          prenom: 'Nadia',
          nom: 'Sanfamiye',
        },
      ],
    }),
  ]
}

export function unEvenementJeuneJson(
  overrides: Partial<EvenementJeuneJson> = {}
): EvenementJeuneJson {
  const defaults: EvenementJeuneJson = {
    id: '1',
    type: { code: 'AUTRE', label: 'Autre' },
    title: 'Prise de nouvelles par téléphone',
    precision: 'Prise de nouvelles',
    modality: 'par téléphone',
    date: '2021-10-21T10:00:00.000Z',
    duration: 125,
    adresse: '36 rue de marseille, 93200 Saint-Denis',
    organisme: 'S.A.R.L',
    presenceConseiller: false,
    invitation: true,
    comment: 'Rendez-vous avec Kenji',
    createur: { id: '1', nom: 'Tavernier', prenom: 'Nils' },
    historique: [
      {
        date: '2021-10-21T10:00:00.000Z',
        auteur: { id: '2', nom: 'Lama', prenom: 'Serge' },
      },
    ],
    source: 'PASS_EMPLOI',
  }

  return { ...defaults, ...overrides }
}

import { DateTime } from 'luxon'

import {
  AnimationCollective,
  Evenement,
  EvenementListItem,
  TypeEvenement,
} from 'interfaces/evenement'
import { EvenementJeuneJson, EvenementJson } from 'interfaces/json/evenement'

export const typesEvenement = (
  overrides: TypeEvenement[] = []
): TypeEvenement[] => {
  return [
    {
      code: 'ACTIVITES_EXTERIEURES',
      label: 'Activités extérieures',
    },
    {
      code: 'ATELIER',
      label: 'Atelier',
    },
    {
      code: 'ENTRETIEN_INDIVIDUEL_CONSEILLER',
      label: 'Entretien individuel conseiller',
    },
    {
      code: 'ENTRETIEN_PARTENAIRE',
      label: 'Entretien par un partenaire',
    },
    {
      code: 'INFORMATION_COLLECTIVE',
      label: 'Information collective',
    },
    {
      code: 'VISITE',
      label: 'Visite',
    },
    {
      code: 'PRESTATION',
      label: 'Prestation',
    },
    {
      code: 'AUTRE',
      label: 'Autre',
    },
    ...overrides,
  ]
}

export function unEvenement(overrides: Partial<Evenement> = {}): Evenement {
  const defaults: Evenement = {
    id: '1',
    titre: 'Prise de nouvelles par téléphone',
    jeunes: [
      {
        id: '1',
        prenom: 'Kenji',
        nom: 'Jirac',
      },
    ],
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
  }

  return { ...defaults, ...overrides }
}

export function desEvenementsListItems(): EvenementListItem[] {
  return [
    unEvenementListItem(),
    {
      id: '2',
      beneficiaires: 'Raja Jirac',
      type: 'Atelier',
      modality: 'En agence',
      date: '2021-10-25T12:00:00.000Z',
      duree: 25,
      idCreateur: '2',
    },
  ]
}

export function unEvenementListItem(
  overrides: Partial<EvenementListItem> = {}
): EvenementListItem {
  const defaults: EvenementListItem = {
    id: '1',
    beneficiaires: 'Kenji Jirac',
    type: 'Autre',
    modality: 'par téléphone',
    date: '2021-10-21T10:00:00.000Z',
    duree: 125,
    idCreateur: '1',
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
    statut: 'A_VENIR',
  }
  return { ...defaults, ...overrides }
}

export function unEvenementJson(
  overrides: Partial<EvenementJson> = {}
): EvenementJson {
  const defaults: EvenementJson = {
    id: '1',
    jeunes: [
      {
        id: '1',
        prenom: 'Kenji',
        nom: 'Jirac',
      },
    ],
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
  }

  return { ...defaults, ...overrides }
}

export function uneListeDeRendezVousJson() {
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
    jeune: {
      id: '1',
      prenom: 'Kenji',
      nom: 'Jirac',
    },
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
  }

  return { ...defaults, ...overrides }
}

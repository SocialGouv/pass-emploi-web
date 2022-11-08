import { RdvJson } from 'interfaces/json/rdv'
import { Rdv, RdvListItem, TypeRendezVous } from 'interfaces/rdv'

export const typesDeRendezVous = (
  overrides: TypeRendezVous[] = []
): TypeRendezVous[] => {
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

export function unRendezVous(overrides: Partial<Rdv> = {}): Rdv {
  const defaults: Rdv = {
    id: '1',
    titre: 'Prise de nouvelles par téléphone',
    jeunes: [
      {
        id: '1',
        prenom: 'kenji',
        nom: 'Jirac',
      },
    ],
    type: { code: 'AUTRE', label: 'Autre' },
    precisionType: 'Prise de nouvelles',
    modality: 'par téléphone',
    date: '2021-10-21T10:00:00.000Z',
    duration: 125,
    adresse: '36 rue de marseille, 93200 Saint-Denis',
    organisme: 'S.A.R.L',
    presenceConseiller: false,
    invitation: true,
    comment: 'Rendez-vous avec Kenji',
    createur: { id: '1', nom: 'Tavernier', prenom: 'Nils' },
  }

  return { ...defaults, ...overrides }
}

export function desRdvListItems(): RdvListItem[] {
  return [
    {
      id: '1',
      beneficiaires: 'Kenji Jirac',
      type: 'Autre',
      modality: 'par téléphone',
      date: '2021-10-21T10:00:00.000Z',
      duration: 125,
      idCreateur: '1',
    },
    {
      id: '2',
      beneficiaires: 'Raja Jirac',
      type: 'Atelier',
      modality: 'En agence',
      date: '2021-10-25T12:00:00.000Z',
      duration: 25,
      idCreateur: '2',
    },
  ]
}

export function unRdvListItem(overrides: Partial<RdvListItem>): RdvListItem {
  const defaults: RdvListItem = {
    id: '1',
    beneficiaires: 'Kenji Jirac',
    type: 'Autre',
    modality: 'par téléphone',
    date: '2021-10-21T10:00:00.000Z',
    duration: 125,
    idCreateur: '1',
  }
  return { ...defaults, ...overrides }
}

export function unRendezVousJson(overrides: Partial<RdvJson> = {}): RdvJson {
  const defaults: RdvJson = {
    id: '1',
    jeunes: [
      {
        id: '1',
        prenom: 'kenji',
        nom: 'Jirac',
      },
    ],
    type: { code: 'AUTRE', label: 'Autre' },
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
  }

  return { ...defaults, ...overrides }
}

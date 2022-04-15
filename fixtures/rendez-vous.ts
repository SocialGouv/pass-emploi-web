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
    jeune: {
      id: '1',
      prenom: 'kenji',
      nom: 'Jirac',
    },
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
    idCreateur: '1',
  }

  return { ...defaults, ...overrides }
}

export const uneListeDeRdv = (): Rdv[] => [
  unRendezVous(),
  {
    id: '2',
    jeune: {
      id: '2',
      prenom: 'Raja',
      nom: 'Jirac',
    },
    type: { code: 'ATELIER', label: 'Atelier' },
    precisionType: '',
    modality: 'En agence',
    date: '2021-10-25T12:00:00.000Z',
    duration: 25,
    adresse: '',
    organisme: '',
    presenceConseiller: true,
    invitation: true,
    comment: 'Mon premier rendez-vous',
    idCreateur: '2',
  },
]

export function desRdvListItems(): RdvListItem[] {
  return [
    {
      id: '1',
      jeune: {
        id: '1',
        prenom: 'kenji',
        nom: 'Jirac',
      },
      type: 'Autre',
      modality: 'par téléphone',
      date: '2021-10-21T10:00:00.000Z',
      duration: 125,
      hasComment: true,
      idCreateur: '1',
    },
    {
      id: '2',
      jeune: {
        id: '2',
        prenom: 'Raja',
        nom: 'Jirac',
      },
      type: 'Atelier',
      modality: 'En agence',
      date: '2021-10-25T12:00:00.000Z',
      duration: 25,
      hasComment: true,
      idCreateur: '2',
    },
  ]
}

export function unRendezVousJson(overrides: Partial<RdvJson> = {}): RdvJson {
  const defaults: RdvJson = {
    id: '1',
    jeune: {
      id: '1',
      prenom: 'kenji',
      nom: 'Jirac',
    },
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
    createur: { id: '1' },
  }

  return { ...defaults, ...overrides }
}

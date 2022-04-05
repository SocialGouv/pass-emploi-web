import { Rdv, TypeRendezVous } from 'interfaces/rdv'

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
    comment: 'Rendez-vous avec Kenji',
    date: '2021-10-21T10:00:00.000Z',
    duration: 125,
    type: { code: 'AUTRE', label: 'Autre' },
    precisionType: 'Prise de nouvelles',
    modality: 'par téléphone',
    jeune: {
      id: '1',
      prenom: 'kenji',
      nom: 'Jirac',
    },
    presenceConseiller: false,
    invitation: true,
  }

  return { ...defaults, ...overrides }
}

export const uneListeDeRdv = (overrides: Rdv[] = []): Rdv[] => [
  unRendezVous(),
  {
    id: '2',
    comment: 'Mon premier rendez-vous',
    date: '2021-10-25T12:00:00.000Z',
    duration: 25,
    type: { code: 'ATELIER', label: 'Atelier' },
    precisionType: '',
    modality: 'En agence',
    jeune: {
      id: '2',
      prenom: 'Raja',
      nom: 'Jirac',
    },
    presenceConseiller: true,
    invitation: true,
  },
  ...overrides,
]

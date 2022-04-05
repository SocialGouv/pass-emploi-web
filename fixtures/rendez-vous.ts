import { Rdv, TypeRendezVous } from 'interfaces/rdv'

export const typesDeRendezVous = (
  overrides: TypeRendezVous[] = []
): TypeRendezVous[] => {
  return [
    {
      code: 'ACTIVITE_EXTERIEURES',
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
    subtitle: 'RDV Kenji',
    comment: 'Rendez-vous avec Kenji',
    date: 'Thu, 21 Oct 2021 10:00:00 GMT',
    duration: '30 min',
    type: { code: 'ACTIVITES_EXTERIEURES', label: 'Activités extérieures' },
    modality: 'Par téléphone',
    jeune: {
      id: '1',
      prenom: 'kenji',
      nom: 'Jirac',
    },
  }

  return { ...defaults, ...overrides }
}

export const uneListeDeRdv = (overrides: Rdv[] = []): Rdv[] => [
  unRendezVous(),
  {
    id: '2',
    subtitle: '1er RDV',
    comment: 'Mon premier rendez-vous',
    date: 'Mon, 25 Oct 2021 12:00:00 GMT',
    duration: '25 min',
    type: { code: 'ATELIER', label: 'Atelier' },
    modality: 'En agence',
    jeune: {
      id: '2',
      prenom: 'Raja',
      nom: 'Jirac',
    },
  },
  ...overrides,
]

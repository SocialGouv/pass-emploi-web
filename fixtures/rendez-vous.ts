import { Rdv, RdvJeune, TypeRendezVous } from 'interfaces/rdv'

export const typesDeRendezVous = (overrides: TypeRendezVous[] = []): TypeRendezVous[] =>{
  return [
    {
      "code": "ACTIVITE_EXTERIEURES",
      "label": "Activités extérieures"
    },
    {
      "code": "ATELIER",
      "label": "Atelier"
    },
    {
      "code": "ENTRETIEN_INDIVIDUEL_CONSEILLER",
      "label": "Entretien individuel conseiller"
    },
    {
      "code": "ENTRETIEN_PARTENAIRE",
      "label": "Entretien par un partenaire"
    },
    {
      "code": "INFORMATION_COLLECTIVE",
      "label": "Information collective"
    },
    {
      "code": "VISITE",
      "label": "Visite"
    },
    {
      "code": "PRESTATION",
      "label": "Prestation"
    },
    {
      "code": "AUTRE",
      "label": "Autre"
    }
  ]

}

export const uneListeDeRdv = (overrides: Partial<Rdv[]> = []): Rdv[] =>
  [
    {
      id: '1',
      comment: 'Rendez-vous avec Kenji',
      date: 'Thu, 21 Oct 2021 10:00:00 GMT',
      duration: '30 min',
      modality: 'Par téléphone',
      jeune: {
        id: '1',
        prenom: 'kenji',
        nom: 'Jirac',
      },
    },
    {
      id: '2',
      comment: 'Mon premier rendez-vous',
      date: 'Mon, 25 Oct 2021 12:00:00 GMT',
      duration: '25 min',
      modality: 'En agence',
      jeune: {
        id: '2',
        prenom: 'Raja',
        nom: 'Jirac',
      },
    },
    ...overrides,
  ] as Rdv[]

export const uneListeDeRdvJeune = (overrides: RdvJeune[] = []): RdvJeune[] =>
  [
    {
      id: '1',
      comment: 'Mon premier rendez-vous',
      date: 'Mon, 25 Oct 2021 07:00:00 GMT',
      duration: '25',
      modality: 'En agence',
      jeune: {
        id: '1',
        prenom: 'kenji',
        nom: 'Jirac',
      },
    },
    {
      id: '2',
      comment: 'Rendez-vous avec Kenji',
      date: 'Thu, 21 Oct 2021 07:00:00 GMT',
      duration: '30',
      modality: 'Par téléphone',
      jeune: {
        id: '1',
        prenom: 'kenji',
        nom: 'Jirac',
      },
    },
    {
      id: '3',
      comment: 'Rendez-vous dans 10 ans',
      date: 'Thu, 21 Oct 2021 12:00:00 GMT',
      duration: '30',
      modality: 'Par téléphone',
    },
    ...overrides,
  ] as RdvJeune[]

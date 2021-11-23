import { Rdv, RdvJeune } from 'interfaces/rdv'

export const uneListeDeRdv = (overrides: Partial<Rdv[]> = []): Rdv[] =>
  [
    {
      id: '1',
      title: 'Rama',
      comment: 'Rendez-vous avec Rama',
      date: 'Thu, 21 Oct 2021 10:00:00 GMT',
      duration: '30 min',
      modality: 'Par téléphone',
    },
    {
      id: '2',
      title: 'Sixtine',
      comment: 'Mon premier rendez-vous',
      date: 'Mon, 25 Oct 2021 12:00:00 GMT',
      duration: '25 min',
      modality: 'En agence',
    },
    ...overrides,
  ] as Rdv[]

export const uneListeDeRdvJeune = (overrides: RdvJeune[] = []): RdvJeune[] =>
  [
    {
      id: '1',
      comment: 'Rendez-vous avec Rama',
      date: 'Thu, 21 Oct 2021 10:00:00 GMT',
      duration: '30 min',
      modality: 'Par téléphone',
    },
    {
      id: '2',
      comment: 'Mon premier rendez-vous',
      date: 'Mon, 25 Oct 2021 12:00:00 GMT',
      duration: '25 min',
      modality: 'En agence',
    },
    ...overrides,
  ] as RdvJeune[]

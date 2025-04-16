import { Offre } from 'interfaces/favoris'
import { OffreJson } from 'interfaces/json/favoris'

export function uneListeDOffres(): Offre[] {
  return [
    {
      id: 'idOffre1',
      titre: 'offre 1',
      type: 'Offre d’emploi',
      organisation: 'organisation',
      localisation: 'localisation',
      urlParam: 'emploi',
      dateUpdate: '2025-03-07T08:51:00',
      aPostule: true,
    },
    {
      id: 'idOffre2',
      titre: 'offre 2',
      type: 'Service civique',
      organisation: 'organisation',
      localisation: 'localisation',
      urlParam: 'service-civique',
      dateUpdate: '2025-03-01T12:34:35',
      aPostule: false,
    },
    {
      id: 'idOffre3',
      titre: 'offre 3',
      type: 'Immersion',
      organisation: 'organisation',
      localisation: 'localisation',
      urlParam: 'immersion',
      dateUpdate: '2025-02-27T10:05:35',
      aPostule: false,
    },
    {
      id: 'idOffre4',
      titre: 'offre 4',
      type: 'Alternance',
      organisation: 'organisation',
      localisation: 'localisation',
      urlParam: 'alternance',
      dateUpdate: '2025-02-22T22:22:22',
      aPostule: false,
    },
  ]
}

export function uneListeDOffresJson(): OffreJson[] {
  return [
    {
      idOffre: 'idOffre1',
      titre: 'offre 1',
      type: 'OFFRE_EMPLOI',
      organisation: 'organisation',
      localisation: 'localisation',
      dateCreation: '2025-03-06T11:54:15',
      dateCandidature: '2025-03-07T08:51:00',
    },
    {
      idOffre: 'idOffre2',
      titre: 'offre 2',
      type: 'OFFRE_SERVICE_CIVIQUE',
      organisation: 'organisation',
      localisation: 'localisation',
      dateCreation: '2025-03-01T12:34:35',
    },
    {
      idOffre: 'idOffre3',
      titre: 'offre 3',
      type: 'OFFRE_IMMERSION',
      organisation: 'organisation',
      localisation: 'localisation',
      dateCreation: '2025-02-27T10:05:35',
    },
    {
      idOffre: 'idOffre4',
      titre: 'offre 4',
      type: 'OFFRE_ALTERNANCE',
      organisation: 'organisation',
      localisation: 'localisation',
      dateCreation: '2025-02-22T22:22:22',
    },
  ]
}

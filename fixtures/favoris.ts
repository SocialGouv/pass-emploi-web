import { DateTime } from 'luxon'

import { Offre, Recherche } from 'interfaces/favoris'
import { OffreJson, RechercheJson } from 'interfaces/json/favoris'

export function uneListeDOffres(): Offre[] {
  return [
    {
      id: 'idOffre1',
      titre: 'offre 1',
      type: 'Offre d’emploi',
      organisation: 'organisation',
      localisation: 'localisation',
      urlParam: 'emploi',
      dateUpdate: DateTime.fromISO('2025-03-07T08:51:00'),
      aPostule: true,
    },
    {
      id: 'idOffre2',
      titre: 'offre 2',
      type: 'Service civique',
      organisation: 'organisation',
      localisation: 'localisation',
      urlParam: 'service-civique',
      dateUpdate: DateTime.fromISO('2025-03-01T12:34:35'),
      aPostule: false,
    },
    {
      id: 'idOffre3',
      titre: 'offre 3',
      type: 'Immersion',
      organisation: 'organisation',
      localisation: 'localisation',
      urlParam: 'immersion',
      dateUpdate: DateTime.fromISO('2025-02-27T10:05:35'),
      aPostule: false,
    },
    {
      id: 'idOffre4',
      titre: 'offre 4',
      type: 'Alternance',
      organisation: 'organisation',
      localisation: 'localisation',
      urlParam: 'alternance',
      dateUpdate: DateTime.fromISO('2025-02-22T22:22:22'),
      aPostule: false,
    },
  ]
}

export function uneListeDeRecherches(): Recherche[] {
  return [
    {
      id: '1',
      titre: 'recherche 1',
      type: 'Offres d’emploi',
      metier: 'metier',
      localisation: 'localisation',
    },
    {
      id: '2',
      titre: 'recherche 2',
      type: 'Alternances',
      metier: 'metier',
      localisation: 'localisation',
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

export function uneListeDeRecherchesJson(): RechercheJson[] {
  return [
    {
      id: '1',
      titre: 'recherche 1',
      type: 'OFFRES_EMPLOI',
      metier: 'metier',
      localisation: 'localisation',
    },
    {
      id: '2',
      titre: 'recherche 2',
      type: 'OFFRES_ALTERNANCE',
      metier: 'metier',
      localisation: 'localisation',
    },
  ]
}

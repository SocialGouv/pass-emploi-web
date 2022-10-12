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
      isEmploi: true,
      isAlternance: false,
      isServiceCivique: false,
    },
    {
      id: 'idOffre2',
      titre: 'offre 2',
      type: 'Service civique',
      organisation: 'organisation',
      localisation: 'localisation',
      isEmploi: false,
      isAlternance: false,
      isServiceCivique: true,
    },
    {
      id: 'idOffre3',
      titre: 'offre 3',
      type: 'Immersion',
      organisation: 'organisation',
      localisation: 'localisation',
      isEmploi: false,
      isAlternance: false,
      isServiceCivique: false,
    },
    {
      id: 'idOffre4',
      titre: 'offre 4',
      type: 'Alternance',
      organisation: 'organisation',
      localisation: 'localisation',
      isEmploi: false,
      isAlternance: true,
      isServiceCivique: false,
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
    },
    {
      idOffre: 'idOffre2',
      titre: 'offre 2',
      type: 'OFFRE_SERVICE_CIVIQUE',
      organisation: 'organisation',
      localisation: 'localisation',
    },
    {
      idOffre: 'idOffre3',
      titre: 'offre 3',
      type: 'OFFRE_IMMERSION',
      organisation: 'organisation',
      localisation: 'localisation',
    },
    {
      idOffre: 'idOffre4',
      titre: 'offre 4',
      type: 'OFFRE_ALTERNANCE',
      organisation: 'organisation',
      localisation: 'localisation',
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

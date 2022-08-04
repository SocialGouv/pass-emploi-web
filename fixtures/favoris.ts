import { Offre, Recherche } from 'interfaces/favoris'
import { OffreJson, RechercheJson } from 'interfaces/json/favoris'

export function uneListeDOffres(): Offre[] {
  return [
    {
      id: '1',
      titre: 'offre 1',
      type: 'Offre d’emploi',
      organisation: 'organisation',
      localisation: 'localisation',
    },
    {
      id: '2',
      titre: 'offre 2',
      type: 'Alternance',
      organisation: 'organisation',
      localisation: 'localisation',
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
      idOffre: '1',
      titre: 'offre 1',
      type: 'OFFRE_EMPLOI',
      organisation: 'organisation',
      localisation: 'localisation',
    },
    {
      idOffre: '2',
      titre: 'offre 2',
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

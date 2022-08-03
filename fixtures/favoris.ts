import { TypeOffre, TypeRecherche } from 'interfaces/favoris'
import { TypeOffreJson, TypeRechercheJson } from 'interfaces/json/favoris'

export function uneListeDOffres() {
  return [
    {
      id: '1',
      titre: 'titre',
      type: TypeOffre.OFFRE_EMPLOI,
      organisation: 'organisation',
      localisation: 'localisation',
    },
    {
      id: '2',
      titre: 'titre',
      type: TypeOffre.OFFRE_ALTERNANCE,
      organisation: 'organisation',
      localisation: 'localisation',
    },
  ]
}

export function uneListeDeRecherches() {
  return [
    {
      id: '1',
      titre: 'titre',
      type: TypeRecherche.OFFRES_EMPLOI,
      metier: 'metier',
      localisation: 'localisation',
    },
    {
      id: '2',
      titre: 'titre',
      type: TypeRecherche.OFFRES_ALTERNANCE,
      metier: 'metier',
      localisation: 'localisation',
    },
  ]
}

export function uneListeDOffresJson() {
  return [
    {
      idOffre: '1',
      titre: 'titre',
      type: TypeOffreJson.OFFRE_EMPLOI,
      organisation: 'organisation',
      localisation: 'localisation',
    },
    {
      idOffre: '2',
      titre: 'titre',
      type: TypeOffreJson.OFFRE_ALTERNANCE,
      organisation: 'organisation',
      localisation: 'localisation',
    },
  ]
}

export function uneListeDeRecherchesJson() {
  return [
    {
      id: '1',
      titre: 'titre',
      type: TypeRechercheJson.OFFRES_EMPLOI,
      metier: 'metier',
      localisation: 'localisation',
    },
    {
      id: '2',
      titre: 'titre',
      type: TypeRechercheJson.OFFRES_ALTERNANCE,
      metier: 'metier',
      localisation: 'localisation',
    },
  ]
}

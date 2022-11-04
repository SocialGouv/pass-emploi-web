import { uneCommune } from 'fixtures/referentiel'
import { SearchOffresEmploiQuery } from 'services/offres-emploi.service'

export const desCriteresDeRecherchesOffreEmploi =
  (): SearchOffresEmploiQuery => {
    return {
      motsCles: 'Prof',
      commune: uneCommune(),
      rayon: 100,
      debutantAccepte: true,
      typesContrats: ['CDI', 'autre'],
      durees: ['Temps plein', 'Temps partiel'],
    }
  }

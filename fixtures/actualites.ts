import { Actualites } from 'interfaces/actualites'

export const uneActualite = (): Actualites => {
  return {
    contenu:
      "<h2 class='wp-block-heading'>Nouveauté</h2><a href='http://www.google.com'>http://www.google.com</a>",
    dateDerniereModification: '2024-10-30',
  }
}

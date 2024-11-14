import { Actualites } from 'interfaces/actualites'

export const uneActualite = (): Actualites => {
  return {
    contenu:
      '<h3>Invitation à la journée présentiel du 31 octobre 2024</h3><p>Rdv demain aux nouveaux locaux de la Fabrique</p><hr />',
    dateDerniereModification: '2024-10-30',
  }
}

import { ActualitesParsees, ActualitesRaw } from 'interfaces/actualites'

export const uneActualite = (): ActualitesParsees => {
  return {
    articles: [
      {
        id: 'id-article',
        contenu: <p>Rdv demain aux nouveaux locaux de la Fabrique</p>,
        titre: 'Invitation à la journée présentiel du 31 octobre 2024',
      },
    ],
    dateDerniereModification: '2024-10-30',
  }
}

export const uneActualiteRaw = (): ActualitesRaw => {
  return {
    articles: [
      {
        id: 'id-article',
        contenu: '<p>Rdv demain aux nouveaux locaux de la Fabrique</p>',
        titre: 'Invitation à la journée présentiel du 31 octobre 2024',
      },
    ],
    dateDerniereModification: '2024-10-30',
  }
}

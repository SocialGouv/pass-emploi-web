import { ActualitesRaw } from 'interfaces/actualites'

export function desActualitesRaw(): ActualitesRaw {
  return [
    {
      id: 1,
      titre: 'Invitation à la journée présentiel du 31 octobre 2024',
      etiquettes: [
        { id: 35, nom: 'Recette', couleur: 'primary' },
        { id: 42, nom: 'Test', couleur: 'warning' },
      ],
      contenu:
        '<p /><p>Rdv demain aux nouveaux locaux de la Fabrique</p>    <p/><a href="perdu.com">Vous êtes perdu ?</a><p></p><img src="pouetImg.jpg" alt="pouet" />',
      dateDerniereModification: '2024-10-30',
    },
  ]
}

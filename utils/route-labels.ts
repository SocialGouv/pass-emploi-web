const routesToLabel = new Map<RegExp, string>([
  // Agenda
  [/\/mes-rendezvous$/, 'Agenda'],

  // Portefeuille
  [/\/mes-jeunes$/, 'Portefeuille'],
  [/\/mes-jeunes\/(milo|pole-emploi)\/creation-jeune$/, 'Création'],
  [/\/mes-jeunes\/[\w-]+$/, 'Fiche jeune'],
  [/\/mes-jeunes\/[\w-]+\/favoris$/, 'Favoris'],
  [/\/mes-jeunes\/[\w-]+\/historique$/, 'Historique'],
  [/\/mes-jeunes\/[\w-]+\/indicateurs$/, 'Indicateurs'],
  [/\/mes-jeunes\/[\w-]+\/rendez-vous-passes$/, 'Rendez-vous passés'],
  [/\/mes-jeunes\/[\w-]+\/actions\/[\w-]+$/, 'Détail action'],

  // Offres
  [/\/recherche-offres$/, 'Offres'],
  [/\/offres$/, 'Offres'],
  [/\/offres\/[\w-]+\/[\w-]+$/, 'Détail offre'],
])

export default routesToLabel

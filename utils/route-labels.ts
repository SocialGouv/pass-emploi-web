const mapRoutesToLabels: Map<RegExp, string> = new Map<RegExp, string>([
  // Agenda
  [/\/mes-jeunes\/edition-rdv\?idRdv=.*$/, 'Fiche événement'],
  [/\/agenda$/, 'Agenda'],

  // Listes de diffusion
  [/\/mes-jeunes\/listes-de-diffusion$/, 'Mes listes'],

  // Portefeuille
  [/\/mes-jeunes$/, 'Portefeuille'],
  [/\/mes-jeunes\/(milo|pole-emploi)\/creation-jeune$/, 'Création'],
  [/\/mes-jeunes\/[\w-]+$/, 'Fiche jeune'],
  [/\/mes-jeunes\/[\w-]+\/favoris$/, 'Favoris'],
  [/\/mes-jeunes\/[\w-]+\/historique$/, 'Historique'],
  [/\/mes-jeunes\/[\w-]+\/indicateurs$/, 'Indicateurs'],
  [/\/mes-jeunes\/[\w-]+\/rendez-vous-passes$/, 'Rendez-vous passés'],
  [/\/mes-jeunes\/[\w-]+\/actions\/[\w-]+$/, 'Détail action'],

  // Établissement
  [/\/etablissement\/jeunes$/, 'Bénéficiaires'],
  [/\/etablissement\/jeunes\/(milo|pole-emploi)\/creation-jeune$/, 'Création'],
  [/\/etablissement\/jeunes\/[\w-]+$/, 'Fiche jeune'],
  [/\/etablissement\/jeunes\/[\w-]+\/favoris$/, 'Favoris'],
  [/\/etablissement\/jeunes\/[\w-]+\/historique$/, 'Historique'],
  [/\/etablissement\/jeunes\/[\w-]+\/indicateurs$/, 'Indicateurs'],
  [
    /\/etablissement\/jeunes\/[\w-]+\/rendez-vous-passes$/,
    'Rendez-vous passés',
  ],
  [/\/etablissement\/jeunes\/[\w-]+\/actions\/[\w-]+$/, 'Détail action'],

  // Offres
  [/\/recherche-offres$/, 'Offres'],
  [/\/offres$/, 'Offres'],
  [/\/offres\/[\w-]+\/[\w-]+$/, 'Détail offre'],

  [/\/pilotage$/, 'Pilotage'],
])

export default mapRoutesToLabels

const labelFicheBeneficiaire = 'Fiche bénéficiaire'
const labelFavoris = 'Favoris'
const labelRdvPasses = 'Rendez-vous passés'
const labelAction = 'Détail action'
const labelDemarche = 'Détail démarche'

const mapRoutesToLabels: Map<RegExp, string> = new Map<RegExp, string>([
  // Agenda
  [/\/mes-jeunes\/edition-rdv$/, 'Fiche événement'],
  [/\/agenda$/, 'Agenda'],
  [/\/agenda\/sessions\/[\w-]+$/, 'Détail session'],

  // Listes de diffusion
  [/\/mes-jeunes\/listes-de-diffusion$/, 'Mes listes'],

  // Portefeuille
  [/\/mes-jeunes$/, 'Portefeuille'],
  [/\/mes-jeunes\/creation-jeune$/, 'Création'],
  [/\/mes-jeunes\/[\w-]+$/, labelFicheBeneficiaire],
  [/\/mes-jeunes\/[\w-]+\/favoris$/, labelFavoris],
  [/\/mes-jeunes\/[\w-]+\/rendez-vous-passes$/, labelRdvPasses],
  [/\/mes-jeunes\/[\w-]+\/actions\/[\w-]+$/, labelAction],
  [/\/mes-jeunes\/[\w-]+\/demarches\/[\w-]+$/, labelDemarche],

  // Établissement
  [/\/etablissement$/, 'Bénéficiaires'],
  [/\/etablissement\/beneficiaires\/[\w-]+$/, labelFicheBeneficiaire],
  [/\/etablissement\/beneficiaires\/[\w-]+\/favoris$/, labelFavoris],
  [
    /\/etablissement\/beneficiaires\/[\w-]+\/rendez-vous-passes$/,
    labelRdvPasses,
  ],
  [/\/etablissement\/beneficiaires\/[\w-]+\/actions\/[\w-]+$/, labelAction],

  // Offres
  [/\/recherche-offres$/, 'Offres'],
  [/\/offres$/, 'Offres'],
  [/\/offres\/[\w-]+\/[\w-]+$/, 'Détail offre'],

  [/\/reaffectation$/, 'Réaffectation'],
  [/\/pilotage$/, 'Pilotage'],
  [/\/profil$/, 'Profil'],

  // Messagerie
  [/\/messagerie$/, 'Messagerie'],

  // Plan du site
  [/\/plan-du-site$/, 'Plan du site'],
])

export default mapRoutesToLabels

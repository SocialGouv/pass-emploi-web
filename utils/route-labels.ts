const labelFicheBeneficiaire = 'Fiche bénéficiaire'
const labelFavoris = 'Favoris'
const labelHistorique = 'Historique'
const labelIndicateurs = 'Indicateurs'
const labelRdvPasses = 'Rendez-vous passés'
const labelAction = 'Détail action'

const mapRoutesToLabels: Map<RegExp, string> = new Map<RegExp, string>([
  // Agenda
  [/\/mes-jeunes\/edition-rdv$/, 'Fiche événement'],
  [/\/agenda$/, 'Agenda'],
  [/\/agenda\/sessions\/[\w-]+$/, 'Détail session'],

  // Listes de diffusion
  [/\/mes-jeunes\/listes-de-diffusion$/, 'Mes listes'],

  // Portefeuille
  [/\/mes-jeunes$/, 'Portefeuille'],
  [/\/mes-jeunes\/(milo|pole-emploi)\/creation-jeune$/, 'Création'],
  [/\/mes-jeunes\/[\w-]+$/, labelFicheBeneficiaire],
  [/\/mes-jeunes\/[\w-]+\/favoris$/, labelFavoris],
  [/\/mes-jeunes\/[\w-]+\/historique$/, labelHistorique],
  [/\/mes-jeunes\/[\w-]+\/indicateurs$/, labelIndicateurs],
  [/\/mes-jeunes\/[\w-]+\/rendez-vous-passes$/, labelRdvPasses],
  [/\/mes-jeunes\/[\w-]+\/actions\/[\w-]+$/, labelAction],

  // Établissement
  [/\/etablissement$/, 'Bénéficiaires'],
  [/\/etablissement\/beneficiaires\/[\w-]+$/, labelFicheBeneficiaire],
  [/\/etablissement\/beneficiaires\/[\w-]+\/favoris$/, labelFavoris],
  [/\/etablissement\/beneficiaires\/[\w-]+\/historique$/, labelHistorique],
  [/\/etablissement\/beneficiaires\/[\w-]+\/indicateurs$/, labelIndicateurs],
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
])

export default mapRoutesToLabels

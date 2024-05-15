export type statutPJ =
  | 'analyse_a_faire'
  | 'analyse_en_cours'
  | 'valide'
  | 'non_valide'
  | 'expiree'

export interface InfoFichier {
  id: string
  nom: string
  statut?: statutPJ
}

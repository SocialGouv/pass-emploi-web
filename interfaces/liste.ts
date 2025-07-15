import { IdentiteBeneficiaire } from 'interfaces/beneficiaire'

export type Liste = {
  id: string
  titre: string
  beneficiaires: Array<
    IdentiteBeneficiaire & {
      estDansLePortefeuille: boolean
    }
  >
}

export function getListeInformations(l: Liste): string {
  return `${l.titre} (${l.beneficiaires.length})`
}

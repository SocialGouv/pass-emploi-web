import { IdentiteBeneficiaire } from 'interfaces/beneficiaire'

export type ListeDeDiffusion = {
  id: string
  titre: string
  beneficiaires: Array<
    IdentiteBeneficiaire & {
      estDansLePortefeuille: boolean
    }
  >
}

export function getListeInformations(l: ListeDeDiffusion): string {
  return `${l.titre} (${l.beneficiaires.length})`
}

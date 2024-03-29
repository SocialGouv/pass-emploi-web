import { BaseJeune } from 'interfaces/jeune'

export type ListeDeDiffusion = {
  id: string
  titre: string
  beneficiaires: Array<
    BaseJeune & {
      estDansLePortefeuille: boolean
    }
  >
}

export function getListeInformations(l: ListeDeDiffusion): string {
  return `${l.titre} (${l.beneficiaires.length})`
}

import { uneBaseBeneficiaire } from 'fixtures/beneficiaire'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'

export function desListesDeDiffusion(): ListeDeDiffusion[] {
  return [
    uneListeDeDiffusion(),
    uneListeDeDiffusion({
      id: 'liste-2',
      titre: 'Liste métiers pâtisserie',
      beneficiaires: [
        { ...uneBaseBeneficiaire(), estDansLePortefeuille: false },
      ],
    }),
  ]
}

export function uneListeDeDiffusion(
  overrides: Partial<ListeDeDiffusion> = {}
): ListeDeDiffusion {
  const defaults: ListeDeDiffusion = {
    id: 'liste-1',
    titre: 'Liste export international',
    beneficiaires: [{ ...uneBaseBeneficiaire(), estDansLePortefeuille: true }],
  }
  return { ...defaults, ...overrides }
}

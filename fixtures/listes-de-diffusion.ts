import { uneBaseJeune } from 'fixtures/jeune'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'

export function uneListeDeDiffusion(
  overrides: Partial<ListeDeDiffusion> = {}
): ListeDeDiffusion {
  const defaults: ListeDeDiffusion = {
    id: '1',
    titre: 'Liste export international',
    beneficiaires: [{ ...uneBaseJeune(), estDansLePortefeuille: true }],
  }
  return { ...defaults, ...overrides }
}

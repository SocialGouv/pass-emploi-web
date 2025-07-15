import { uneBaseBeneficiaire } from 'fixtures/beneficiaire'
import { Liste } from 'interfaces/liste'

export function desListes(): Liste[] {
  return [
    uneListe(),
    uneListe({
      id: 'liste-2',
      titre: 'Liste métiers pâtisserie',
      beneficiaires: [
        { ...uneBaseBeneficiaire(), estDansLePortefeuille: false },
      ],
    }),
  ]
}

export function uneListe(overrides: Partial<Liste> = {}): Liste {
  const defaults: Liste = {
    id: 'liste-1',
    titre: 'Liste export international',
    beneficiaires: [{ ...uneBaseBeneficiaire(), estDansLePortefeuille: true }],
  }
  return { ...defaults, ...overrides }
}

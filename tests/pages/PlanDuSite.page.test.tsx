import { act } from '@testing-library/react'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import React from 'react'

import PlanDuSitePage from 'app/(connected)/(with-sidebar)/(with-chat)/plan-du-site/PlanDuSitePage'
import { StructureConseiller } from 'interfaces/conseiller'
import renderWithContexts from 'tests/renderWithContexts'

describe('PlanDuSite client side', () => {
  let container: HTMLElement

  it('a11y Milo', async () => {
    //When
    ;({ container } = renderWithContexts(<PlanDuSitePage />, {
      customConseiller: {
        structure: StructureConseiller.MILO,
      },
    }))

    //Then
    let results: AxeResults
    await act(async () => {
      results = await axe(container)
    })

    expect(results!).toHaveNoViolations()
  })

  it('a11y France Travail', async () => {
    //When
    ;({ container } = renderWithContexts(<PlanDuSitePage />, {
      customConseiller: {
        structure: StructureConseiller.POLE_EMPLOI,
      },
    }))

    //Then
    let results: AxeResults
    await act(async () => {
      results = await axe(container)
    })

    expect(results!).toHaveNoViolations()
  })
})

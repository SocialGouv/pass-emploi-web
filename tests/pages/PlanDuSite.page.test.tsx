import { act } from '@testing-library/react'
import { AxeResults } from 'axe-core'
import { axe } from 'jest-axe'
import React from 'react'

import PlanDuSitePage from 'app/(connected)/(with-sidebar)/(with-chat)/plan-du-site/PlanDuSitePage'
import { structureFTCej, structureMilo } from 'interfaces/structure'
import renderWithContexts from 'tests/renderWithContexts'

describe('PlanDuSite client side', () => {
  it('a11y Milo', async () => {
    //When
    const { container } = await renderWithContexts(<PlanDuSitePage />, {
      customConseiller: {
        structure: structureMilo,
      },
    })

    //Then
    let results: AxeResults
    await act(async () => {
      results = await axe(container)
    })

    expect(results!).toHaveNoViolations()
  })

  it('a11y France Travail', async () => {
    //When
    const { container } = await renderWithContexts(<PlanDuSitePage />, {
      customConseiller: {
        structure: structureFTCej,
      },
    })

    //Then
    let results: AxeResults
    await act(async () => {
      results = await axe(container)
    })

    expect(results!).toHaveNoViolations()
  })
})

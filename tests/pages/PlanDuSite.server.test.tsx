import { render } from '@testing-library/react'
import { headers } from 'next/headers'

import PlanDuSite, {
  metadata,
} from 'app/(connected)/(with-sidebar)/(with-chat)/plan-du-site/page'
import PlanDuSitePage from 'app/(connected)/(with-sidebar)/(with-chat)/plan-du-site/PlanDuSitePage'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

jest.mock('utils/auth/auth', () => ({
  getMandatorySessionServerSide: jest.fn(),
}))
jest.mock(
  'app/(connected)/(with-sidebar)/(with-chat)/plan-du-site/PlanDuSitePage'
)

describe('PlanDuSite server side', () => {
  it('prépare la page pour un nouveau conseiller', async () => {
    // Given
    ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
      user: {},
      accessToken: 'accessToken',
    })
    ;(headers as jest.Mock).mockReturnValue(
      new Map([['referer', 'http://localhost:3000/agenda']])
    )

    // When
    render(await PlanDuSite())

    // Then
    expect(metadata).toEqual({ title: 'Plan du site' })
    expect(PlanDuSitePage).toHaveBeenCalledWith({}, {})
  })
})

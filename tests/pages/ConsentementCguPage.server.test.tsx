import { render } from '@testing-library/react'

import ConsentementCguPage from 'app/(connected)/(full-page)/consentement-cgu/ConsentementCguPage'
import ConsentementCgu, {
  metadata,
} from 'app/(connected)/(full-page)/consentement-cgu/page'

jest.mock(
  'app/(connected)/(full-page)/consentement-cgu/ConsentementCguPage',
  () => jest.fn()
)
jest.mock('next/headers', () => ({ headers: jest.fn(() => new Map()) }))

describe('ConsentementCGUPage server side', () => {
  it('prépare la page', async () => {
    // When
    render(ConsentementCgu())

    // Then
    expect(metadata).toEqual({ title: 'Consentement CGU' })
    expect(ConsentementCguPage).toHaveBeenCalledWith(
      {
        returnTo: '/mes-jeunes',
      },
      {}
    )
  })
})

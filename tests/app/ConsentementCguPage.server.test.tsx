import { render } from '@testing-library/react'

import ConsentementCguPage from 'app/(connected)/(full-page)/consentement-cgu/ConsentementCguPage'
import ConsentementCgu, {
  metadata,
} from 'app/(connected)/(full-page)/consentement-cgu/page'
import { unConseiller } from 'fixtures/conseiller'
import { getConseillerServerSide } from 'services/conseiller.service'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

jest.mock('utils/auth/getMandatorySessionServerSide', () => jest.fn())
jest.mock('app/(connected)/(full-page)/consentement-cgu/ConsentementCguPage')
jest.mock('services/conseiller.service')

describe('ConsentementCGUPage server side', () => {
  beforeEach(async () => {
    ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
      user: {},
      accessToken: 'accessToken',
    })
  })

  it('prépare la page pour un nouveau conseiller', async () => {
    // Given
    const nouveauConseiller = { ...unConseiller(), dateSignatureCGU: undefined }
    ;(getConseillerServerSide as jest.Mock).mockResolvedValue(nouveauConseiller)

    // When
    render(await ConsentementCgu())

    // Then
    expect(metadata).toEqual({ title: 'Consentement CGU' })
    expect(ConsentementCguPage).toHaveBeenCalledWith(
      { returnTo: '/?onboarding=true' },
      undefined
    )
  })

  it('prépare la page pour une évolution des CGUs', async () => {
    // Given
    ;(getConseillerServerSide as jest.Mock).mockResolvedValue(unConseiller())

    // When
    render(await ConsentementCgu())

    // Then
    expect(metadata).toEqual({ title: 'Consentement CGU' })
    expect(ConsentementCguPage).toHaveBeenCalledWith(
      { returnTo: '/?' },
      undefined
    )
  })
})

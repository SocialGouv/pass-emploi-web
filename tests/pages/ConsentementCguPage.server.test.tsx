import { render } from '@testing-library/react'

import ConsentementCguPage from 'app/(connected)/(full-page)/consentement-cgu/ConsentementCguPage'
import ConsentementCgu, {
  metadata,
} from 'app/(connected)/(full-page)/consentement-cgu/page'
import { unConseiller } from 'fixtures/conseiller'
import { getConseillerServerSide } from 'services/conseillers.service'

jest.mock('app/(connected)/(full-page)/consentement-cgu/ConsentementCguPage')
jest.mock('services/conseillers.service')

describe('ConsentementCGUPage server side', () => {
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
      {}
    )
  })

  it('prépare la page pour une évolution des CGUs', async () => {
    // Given
    ;(getConseillerServerSide as jest.Mock).mockResolvedValue(unConseiller())

    // When
    render(await ConsentementCgu())

    // Then
    expect(metadata).toEqual({ title: 'Consentement CGU' })
    expect(ConsentementCguPage).toHaveBeenCalledWith({ returnTo: '/?' }, {})
  })
})

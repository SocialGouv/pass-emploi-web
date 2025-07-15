import { render } from '@testing-library/react'
import { headers } from 'next/headers'
import { getListesServerSide } from 'services/listes.service'

import EnvoiMessageGroupePage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/envoi-message-groupe/EnvoiMessageGroupePage'
import EnvoiMessageGroupe, {
  metadata,
} from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/envoi-message-groupe/page'
import { desListes } from 'fixtures/listes'
import getMandatorySessionServerSide from 'utils/auth/getMandatorySessionServerSide'

jest.mock('services/listes.service')
jest.mock('utils/auth/getMandatorySessionServerSide', () => jest.fn())
jest.mock(
  'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/envoi-message-groupe/EnvoiMessageGroupePage'
)
jest.mock('next/headers', () => ({ headers: jest.fn(() => new Map()) }))

describe('EnvoiMessageGroupePage server side', () => {
  const listes = desListes()
  beforeEach(() => {
    // Given
    ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
      user: { id: 'id-conseiller-1' },
      accessToken: 'accessToken',
    })
    ;(getListesServerSide as jest.Mock).mockResolvedValue(listes)
  })

  it('récupère les listes du conseiller', async () => {
    // When
    await EnvoiMessageGroupe()

    // Then
    expect(getListesServerSide).toHaveBeenCalledWith(
      'id-conseiller-1',
      'accessToken'
    )
  })

  it('prépare la page', async () => {
    // Given
    ;(headers as jest.Mock).mockReturnValue(
      new Map([['referer', 'http://localhost:3000/agenda']])
    )

    // When
    render(await EnvoiMessageGroupe())

    // Then
    expect(metadata).toEqual({ title: 'Message multi-destinataires' })
    expect(EnvoiMessageGroupePage).toHaveBeenCalledWith(
      {
        listes: listes,
        returnTo: 'http://localhost:3000/agenda',
      },
      undefined
    )
  })

  it('ignore le referer si besoin', async () => {
    // Given
    ;(headers as jest.Mock).mockReturnValue(
      new Map([
        [
          'referer',
          'http://localhost:3000/?redirectUrl=%2Fmes-jeunes%2Fenvoi-message-groupe',
        ],
      ])
    )

    // When
    render(await EnvoiMessageGroupe())

    // Then
    expect(metadata).toEqual({ title: 'Message multi-destinataires' })
    expect(EnvoiMessageGroupePage).toHaveBeenCalledWith(
      {
        listes: listes,
        returnTo: '/mes-jeunes',
      },
      undefined
    )
  })
})

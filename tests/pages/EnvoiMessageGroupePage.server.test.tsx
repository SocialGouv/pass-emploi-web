import { render } from '@testing-library/react'
import { headers } from 'next/headers'

import EnvoiMessageGroupePage from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/envoi-message-groupe/EnvoiMessageGroupePage'
import EnvoiMessageGroupe, {
  metadata,
} from 'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/envoi-message-groupe/page'
import { desListesDeDiffusion } from 'fixtures/listes-de-diffusion'
import { getListesDeDiffusionServerSide } from 'services/listes-de-diffusion.service'

jest.mock('services/listes-de-diffusion.service')
jest.mock(
  'app/(connected)/(with-sidebar)/(without-chat)/mes-jeunes/envoi-message-groupe/EnvoiMessageGroupePage'
)
jest.mock('next/headers', () => ({ headers: jest.fn(() => new Map()) }))

describe('EnvoiMessageGroupePage server side', () => {
  const listesDeDiffusion = desListesDeDiffusion()
  beforeEach(() => {
    // Given
    ;(getListesDeDiffusionServerSide as jest.Mock).mockResolvedValue(
      listesDeDiffusion
    )
  })

  it('récupère les listes de diffusion du conseiller', async () => {
    // When
    await EnvoiMessageGroupe()

    // Then
    expect(getListesDeDiffusionServerSide).toHaveBeenCalledWith(
      'id-conseiller',
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
        listesDiffusion: listesDeDiffusion,
        returnTo: 'http://localhost:3000/agenda',
      },
      {}
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
        listesDiffusion: listesDeDiffusion,
        returnTo: '/mes-jeunes',
      },
      {}
    )
  })
})

/**
 * @jest-environment node
 */

import { redirect } from 'next/navigation'

import { GET } from 'app/api/fichiers/[idFichier]/route'
import { getMandatorySessionServerSide } from 'utils/auth/auth'

jest.mock('utils/auth/auth', () => ({
  getMandatorySessionServerSide: jest.fn(),
}))

describe('GET api/fichier/[idFichier]', () => {
  it('redirige vers le fichier demandé', async () => {
    // Given
    ;(getMandatorySessionServerSide as jest.Mock).mockResolvedValue({
      accessToken: 'accessToken',
    })

    // When
    const promise = GET(new Request('https://www.perdu.com'), {
      params: Promise.resolve({ idFichier: 'idFichier' }),
    })

    // Then
    await expect(promise).rejects.toEqual(
      new Error(
        'NEXT REDIRECT NEXT_PUBLIC_API_ENDPOINT/fichiers/idFichier?token=accessToken'
      )
    )
    expect(redirect).toHaveBeenCalledWith(
      'NEXT_PUBLIC_API_ENDPOINT/fichiers/idFichier?token=accessToken'
    )
  })
})

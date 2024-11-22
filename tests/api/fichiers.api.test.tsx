/**
 * @jest-environment node
 */

import { redirect } from 'next/navigation'

import { GET } from 'app/api/fichiers/[idFichier]/route'

describe('GET api/fichier/[idFichier]', () => {
  it('redirige vers le fichier demandé', async () => {
    // When
    const promise = GET(new Request('https://www.perdu.com'), {
      params: { idFichier: 'idFichier' },
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

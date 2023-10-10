import { redirect } from 'next/navigation'

import { GET } from 'app/api/auth/federated-logout/route'

jest.mock('next/navigation')

describe('GET api/federated-logout', () => {
  it('déconnecte de l’issuer et redirige vers la suite du logout', async () => {
    // When
    await GET()

    // Then
    expect(redirect).toHaveBeenCalledWith(
      'KEYCLOAK_ISSUER/protocol/openid-connect/logout?redirect_uri=NEXTAUTH_URL%2Flogout'
    )
  })
})

import { redirect } from 'next/navigation'

import { GET } from 'app/api/auth/federated-logout/route'

describe('GET api/federated-logout', () => {
  it('déconnecte de l’issuer et redirige vers la suite du logout', async () => {
    // When
    const promise = GET()

    // Then
    await expect(promise).rejects.toEqual(
      new Error(
        'NEXT REDIRECT KEYCLOAK_ISSUER/protocol/openid-connect/logout?client_id=&post_logout_redirect_uri=NEXTAUTH_URL%2Flogout&redirect_uri=NEXTAUTH_URL%2Flogout'
      )
    )
    expect(redirect).toHaveBeenCalledWith(
      'KEYCLOAK_ISSUER/protocol/openid-connect/logout?client_id=&post_logout_redirect_uri=NEXTAUTH_URL%2Flogout&redirect_uri=NEXTAUTH_URL%2Flogout'
    )
  })
})

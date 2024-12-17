import { isRedirectError } from 'next/dist/client/components/redirect'
import { redirect } from 'next/navigation'

import { getSessionServerSide } from 'utils/auth/auth'

const rootUrl: string | undefined = process.env.NEXTAUTH_URL

export async function GET() {
  if (!(await getSessionServerSide())) redirect('/login')

  try {
    const issuerLogout = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/logout`
    const redirectToSessionLogout = new URLSearchParams({
      client_id: process.env.KEYCLOAK_ID ?? '',
      post_logout_redirect_uri: rootUrl ? `${rootUrl}/logout` : '',
      redirect_uri: rootUrl ? `${rootUrl}/logout` : '',
    })

    redirect(`${issuerLogout}?${redirectToSessionLogout}`)
  } catch (error) {
    if (isRedirectError(error)) throw error

    console.error(error)
    redirect(rootUrl ?? '')
  }
}

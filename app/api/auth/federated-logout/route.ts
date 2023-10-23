import { isRedirectError } from 'next/dist/client/components/redirect'
import { redirect } from 'next/navigation'

export async function GET() {
  const rootUrl: string | undefined = process.env.NEXTAUTH_URL

  try {
    const issuerLogout = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/logout`
    const redirectToSessionLogout = new URLSearchParams({
      redirect_uri: rootUrl ? `${rootUrl}/logout` : '',
    })

    redirect(`${issuerLogout}?${redirectToSessionLogout}`)
  } catch (error) {
    if (isRedirectError(error)) throw error // redirect() renvoie une erreur NEXT_REDIRECT

    console.error(error)
    redirect(rootUrl ?? '')
  }
}

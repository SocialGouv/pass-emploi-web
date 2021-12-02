import { NextApiRequest, NextApiResponse } from 'next'

export default async function federatedLogout(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const endsessionURL = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/logout`
    const endsessionParams = new URLSearchParams({
      redirect_uri: `${process.env.NEXTAUTH_URL}/logout` ?? '',
    })
    return res.redirect(`${endsessionURL}?${endsessionParams}`)
  } catch (error) {
    console.error(error)
    res.redirect(process.env.NEXTAUTH_URL ?? '')
  }
}

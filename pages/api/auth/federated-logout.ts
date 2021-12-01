import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'next-auth/jwt'

export default async function federatedLogout(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // const token = await jwt.getToken({
    //   req,
    //   secret: process.env.KEYCLOAK_SECRET ?? '',
    // })
    // if (!token) {
    //   console.warn('No JWT token found when calling /federated-logout endpoint')
    //   return res.redirect(process.env.NEXTAUTH_URL ?? '')
    // }
    // if (!token.idToken)
    //   console.warn(
    //     "Without an id_token the user won't be redirected back from the IdP after logout."
    //   )

    const endsessionURL = `https://pa-auth-staging.osc-secnum-fr1.scalingo.io/auth/realms/pass-emploi/protocol/openid-connect/logout`
    const endsessionParams = new URLSearchParams({
      redirect_uri: `${process.env.NEXTAUTH_URL}/logout` ?? '',
    })
    // const payload = {
    //   secret: process.env.KEYCLOAK_SECRET,
    // }

    // await fetch(`${endsessionURL}?${endsessionParams}`, {
    //   method: 'POST',
    //   body: JSON.stringify(payload),
    // })
    return res.redirect(`${endsessionURL}?${endsessionParams}`)
  } catch (error) {
    console.error(error)
    res.redirect(process.env.NEXTAUTH_URL ?? '')
  }
}

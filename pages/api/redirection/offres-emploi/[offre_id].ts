import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

export default async function RedirectionOffresEmploi(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const offreId = req.query.offre_id
    const session = await getSession({ req })

    return res.redirect(
      307,
      `${process.env.API_ENDPOINT}/offres-emploi/${offreId}?token=${session?.accessToken}`
    )
  } catch (error) {
    console.error(error)
    res.redirect(process.env.NEXTAUTH_URL ?? '')
  }
}

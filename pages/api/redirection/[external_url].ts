import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

export default async function RedirectionOffresEmploi(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const urlExterne = req.query.external_url
    const session = await getSession({ req })

    return res.redirect(307, `${urlExterne}`)
  } catch (error) {
    console.error(error)
    res.redirect(process.env.NEXTAUTH_URL ?? '')
  }
}

import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

export default async function fichier_id(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const fichierId = req.query.fichier_id
    const session = await getSession({ req })

    return res.redirect(
      307,
      `${process.env.API_ENDPOINT}/fichiers/${fichierId}?token=${session?.accessToken}`
    )
  } catch (error) {
    console.error(error)
    res.redirect(process.env.NEXTAUTH_URL ?? '')
  }
}

import { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth'

import { authOptions } from 'pages/api/auth/[...nextauth]'

export default async function Fichier(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const fichierId = req.query.fichier_id
    const session = await unstable_getServerSession(req, res, authOptions)

    return res.redirect(
      307,
      `${process.env.API_ENDPOINT}/fichiers/${fichierId}?token=${session?.accessToken}`
    )
  } catch (error) {
    console.error(error)
    res.redirect(process.env.NEXTAUTH_URL ?? '')
  }
}

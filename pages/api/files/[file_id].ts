import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

export default async function file_id (
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const fileId = req.query.file_id
    const session = await getSession({ req })

    return res.redirect(307, `http://localhost:5000/files/redirect/${fileId}?token=${session?.accessToken}`)
  } catch (error) {
    console.error(error)
    res.redirect(process.env.NEXTAUTH_URL ?? '')
  }
}

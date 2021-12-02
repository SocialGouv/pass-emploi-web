import { getToken } from 'next-auth/jwt'
import { NextApiRequest, NextApiResponse } from 'next'

const secret = process.env.AUTH_SECRET || ''

export default async (req: NextApiRequest, res: NextApiResponse) => {
  req.url = 'http://localhost:3000/api/auth/token'
  try {
    const token = await getToken({ req, secret })
    if (token) {
      // Signed in
      console.log('JSON Web Token', JSON.stringify(token, null, 2))
    } else {
      // Not Signed in
      res.status(401)
    }
    res.end()
  } catch (error: any) {
    console.log(error)
  }

  console.log('req', req.url)
}

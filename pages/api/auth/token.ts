import { getToken } from 'next-auth/jwt'
import { NextApiRequest, NextApiResponse } from 'next'
import { returnStatement } from '@babel/types'

const secret = process.env.AUTH_SECRET || ''

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  // req.url = 'http://localhost:3000/api/auth/token'
  try {
    console.log(req)
    const token = await getToken({ req, secret })
    if (token) {
      // Signed in
      console.log('JSON Web Token', JSON.stringify(token, null, 2))
      res.json(token)
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

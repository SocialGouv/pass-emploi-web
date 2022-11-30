import { NextApiRequest, NextApiResponse } from 'next'

export default async function federatedLogout(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).json({ status: 'ok' })
}

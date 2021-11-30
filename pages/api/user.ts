import { Conseiller } from 'interfaces'
import { NextApiResponse } from 'next'
import withSession, { getConseillerFromSession } from 'utils/session'

export default withSession(
  async (req, res: NextApiResponse<Conseiller | undefined>) => {
    const conseiller = getConseillerFromSession(req)

    if (conseiller) {
      res.json(conseiller)
    } else {
      res.json(undefined)
    }
  }
)

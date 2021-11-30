import next, { NextApiRequest, NextApiResponse } from 'next'
import { Session } from 'next-iron-session'
type NextIronRequest = NextApiRequest & { session: Session };



import fetchJson from 'utils/fetchJson'
import withSession from 'utils/session'

type Data = {
  firstName: '', lastName : '', id:'', jeunes: []
}

type ApiError = {
  message: '',
}

export default withSession(async (req: NextIronRequest, res: NextApiResponse<Data | ApiError>) => {
    const { userId } = await req.body
  const url = `${process.env.API_ENDPOINT}/conseillers/${userId}/login`

  try {
    // we check that the user exists on GitHub and store some data in session
    const data = await fetchJson(url)

    const user = { isLoggedIn: true, ...data.conseiller }

    req.session.set('user', user)
    await req.session.save()
    res.json(user)

  } catch (error: any) {
    const { response: fetchResponse } = error
    res.status(fetchResponse?.status || 500).json(error.data)
  }
})

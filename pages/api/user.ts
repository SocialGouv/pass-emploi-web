import withSession, { getConseillerFromSession } from 'utils/session'

export default withSession(async (req, res) => {
  const conseillerOuRedirect = getConseillerFromSession(req)

  if (conseillerOuRedirect.hasConseiller) {
    // check if user is already loggedIn before sending to DB
    res.json({
      isLoggedIn: true,
      ...conseillerOuRedirect.conseiller,
    })
  } else {
    res.json({
      isLoggedIn: false,
    })
  }
})

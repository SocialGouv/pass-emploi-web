import { NextPage } from 'next'
import Error from 'next/error'

interface ErrorProps {
  statusCode?: number
  message?: string
}

const CustomError: NextPage<ErrorProps> = ({ statusCode, message }) => (
  <Error statusCode={statusCode || 500} title={message} />
)

CustomError.getInitialProps = ({ req, res, err }) => {
  let props: ErrorProps

  if (res) {
    if (err && err.statusCode === 401) {
      res.writeHead(302, { Location: '/api/auth/federated-logout' })
      res.end()
    }

    props = { statusCode: res.statusCode, message: res.statusMessage }
  } else if (err) {
    props = { statusCode: err.statusCode, message: err.message }
  } else {
    props = { statusCode: 404 }
  }

  const erreur =
    err ?? `Message: ${props.message}, Status Code: ${props.statusCode}`
  const isServerSide = Boolean(req)
  if (isServerSide) {
    const apm = require('elastic-apm-node')
    apm.captureError(erreur)
  }
  return props
}

export default CustomError

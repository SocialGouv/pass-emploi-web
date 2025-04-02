require('dotenv').config({ path: '.env.local' })
const serviceName = process.env.APP || 'pa-front-local'
const apm = require('elastic-apm-node').start({
  serviceName: `ssr-${serviceName}`,
  secretToken: process.env.APM_SECRET_TOKEN || '',
  serverUrl: process.env.NEXT_PUBLIC_APM_URL || '',
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
  active: process.env.NEXT_PUBLIC_APM_IS_ACTIVE === 'true',
})

require('next-logger')
const { createServer } = require('http')
const { parse } = require('url')

const { Settings } = require('luxon')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    apm.setTransactionName(`${req.method} ${parsedUrl.pathname}`)
    handle(req, res, parsedUrl)
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})

Settings.throwOnInvalid = true

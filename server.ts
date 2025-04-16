import { createServer } from 'http'
import { parse } from 'url'

import apm from 'elastic-apm-node/start'
import next from 'next'

import 'next-logger'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000')

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    apm.setTransactionName(`${req.method} ${parsedUrl.pathname}`)
    handle(req, res, parsedUrl)
  }).listen(port)

  console.log(
    `> Ready on http://${hostname}:${port}`,
    `as ${process.env.NODE_ENV}`,
    dev ? '(development)' : ''
  )
})

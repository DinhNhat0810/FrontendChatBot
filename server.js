const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const express = require('express') // Import express
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const messageRoute = require('./backend/routes/sendMessages.js')
const botRoute = require('./backend/routes/bots.js')

const dev = process.env.NODE_ENV !== 'production'

const port = process.env.PORT || 4000
const app = next({ dev, port })
const handle = app.getRequestHandler()

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB Connection Successfull'))
  .catch(err => {
    console.error(err)
  })

app.prepare().then(() => {
  const server = express() // Create an express instance
  server.use(bodyParser.urlencoded({ extended: false }))
  server.use(cors())
  // parse application/json
  server.use(bodyParser.json())

  server.use('/api/send-message', messageRoute)
  server.use('/api/bots', botRoute)

  server.all('*', (req, res) => {
    const parsedUrl = parse(req.url, true)
    const { pathname, query } = parsedUrl

    if (pathname === '/a') {
      return app.render(req, res, '/a', query)
    } else if (pathname === '/b') {
      return app.render(req, res, '/b', query)
    } else {
      return handle(req, res, parsedUrl)
    }
  })

  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})

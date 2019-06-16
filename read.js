const { InfluxDB } = require('influx')

const Server = require('socket.io')
const io = new Server(9009, { serveClient: false })

require('dotenv').config()

const config = require('./config')(process.env.DB_READUSER, process.env.DB_READPASS)
const db = new InfluxDB(config)

io.on('connection', socket => {
  const handler = e => socket.on(e, async (data, arc) => {
    if (typeof arc === 'function') {
      console.log(e)
      if (e === 'lastHour') {
        let query = await db.query('select content from danmaku where time > now() - 1h')
        arc(query.map(({ content }) => content))
      }
      if (e === 'lastDay') {
        let query = await db.query('select content from danmaku where time > now() - 1d')
        arc(query.map(({ content }) => content))
      }
    }
  })

  handler('lastHour')
  handler('lastDay')
})

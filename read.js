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
      if (e === 'bulkLive') {
        let query = await db.query(`select * from watcher where lid = '${Number(data)}' order by time`)
        arc(query.map(({ time, watcher }) => ({ time: time.getTime(), online: watcher })))
      }
      if (e === 'bulkLiveWeek') {
        let query = await db.query(`select * from watcher where lid = '${Number(data)}' and time > now() - 1w order by time`)
        arc(query.map(({ time, watcher }) => ({ time: time.getTime(), online: watcher })))
      }
    }
  })

  handler('lastHour')
  handler('lastDay')
  handler('bulkLive')
  handler('bulkLiveWeek')
})

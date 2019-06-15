const Influx = require('influx');
require('dotenv').config()

const config = require('./config')(process.env.DB_USER, process.env.DB_PASS)

const dbName = process.env.DB_NAME
const db = new Influx.InfluxDB(config)

function record(lid, uid, content) {
  db.writePoints([{
    measurement: 'danmaku',
    tags: {
      lid,
      uid
    },
    fields: {
      content
    }
  }], {
    database: dbName
  }).catch(err => {
    console.error(`Error saving data to InfluxDB! ${err.stack}`)
  })
}

function recordWatcher(lid, watcher) {
  db.writePoints([{
    measurement: 'watcher',
    tags: {
      lid
    },
    fields: {
      watcher
    }
  }], {
    database: dbName
  }).catch(err => {
    console.error(`Error saving data to InfluxDB! ${err.stack}`)
  })
}

function recordStatus(lid, status, hard) {
  db.writePoints([{
    measurement: 'status',
    tags: {
      lid
    },
    fields: {
      status,
      hard
    }
  }], {
    database: dbName
  }).catch(err => {
    console.error(`Error saving data to InfluxDB! ${err.stack}`)
  })
}

function recordTitle(lid, title) {
  if (title == undefined) return
  db.writePoints([{
    measurement: 'title',
    tags: {
      lid
    },
    fields: {
      title
    }
  }], {
    database: dbName
  }).catch(err => {
    console.error(`Error saving data to InfluxDB! ${err.stack}`)
  })
}

function recordGift(lid, uid, giftId, coinType, totalCoin) {
  db.writePoints([{
    measurement: 'gift',
    tags: {
      lid
    },
    fields: {
      uid,
      giftId,
      coinType,
      totalCoin
    }
  }], {
    database: dbName
  }).catch(err => {
    console.error(`Error saving data to InfluxDB! ${err.stack}`)
  })
}

const recordGuard = ({ lid, uid, num, price, giftId,level }) => db.writePoints([{
  measurement: 'guard',
  tags: {
    lid
  },
  fields: {
    uid,
    giftId,
    num,
    price,
    level
  }
}], {
  database: dbName
}).catch(err => {
  console.error(`Error saving data to InfluxDB! ${err.stack}`)
})

const io = require('socket.io-client')
const socket = io('http://0.0.0.0:8001')
const dispatch = io('http://0.0.0.0:9003')

let titleCache = {}

socket.on('info', async info => {
  info.forEach(info => {
    if (info.roomid != undefined) {
      recordStatus(info.roomid, info.liveStatus, false)
      if (titleCache[info.roomid] !== info.title) {
        titleCache[info.roomid] = info.title
        recordTitle(info.roomid, info.title)
      }
    }
  });
})

dispatch.on('LIVE', ({ roomid }) => {
  recordStatus(roomid, 1, true)
})
dispatch.on('PREPARING', ({ roomid }) => {
  recordStatus(roomid, 0, true)
})
dispatch.on('ROUND', ({ roomid }) => {
  recordStatus(roomid, 2, true)
})
dispatch.on('online', ({ roomid, online }) => {
  recordWatcher(roomid, online)
})
dispatch.on('danmaku', ({ message, roomid, mid }) => {
  record(roomid, mid, message)
})
dispatch.on('gift', ({ roomid, mid, giftId, totalCoin, coinType }) => {
  let coinTypeInteger = coinType == 'silver' ? 0 : 1
  recordGift(roomid, mid, giftId, coinTypeInteger, totalCoin)
})
dispatch.on('guard', ({ roomid, mid, num, price, giftId, level }) => {
  recordGuard({ lid: roomid, uid: mid, num, price, giftId, level })
})

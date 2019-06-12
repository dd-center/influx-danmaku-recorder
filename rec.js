const Influx = require('influx');
require('dotenv').config()

const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  schemas: [{
      measurement: 'danmaku',
      tags: ['lid', 'uid'],
      fields: {
        content: Influx.FieldType.STRING
      }
    }, {
      measurement: 'watcher',
      tags: ['lid'],
      fields: {
        count: Influx.FieldType.INTEGER
      }
    },
    {
      measurement: 'status',
      tags: ['lid'],
      fields: {
        status: Influx.FieldType.INTEGER,
        hard: Influx.FieldType.BOOLEAN
      }
    },
    {
      measurement: 'title',
      tags: ['lid'],
      fields: {
        count: Influx.FieldType.STRING
      }
    },
    {
      measurement: 'gift',
      tags: ['lid'],
      fields: {
        uid: Influx.FieldType.INTEGER,
        giftId: Influx.FieldType.INTEGER,
        coinType: Influx.FieldType.INTEGER,
        totalCoin: Influx.FieldType.INTEGER
      }
    },
    {
      measurement: 'guard',
      tags: ['lid'],
      fields: {
        uid: Influx.FieldType.INTEGER,
        giftId: Influx.FieldType.INTEGER,
        num: Influx.FieldType.INTEGER,
        price: Influx.FieldType.INTEGER,
        level: Influx.FieldType.INTEGER
      }
    }
  ]
}

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

socket.on('info', async info => {
  info.forEach(info => {
    if (info.roomid != undefined) {
      recordStatus(info.roomid, info.liveStatus, false)
      recordTitle(info.roomid, info.title)
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

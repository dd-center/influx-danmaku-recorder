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

socket.on('info', async info => {
  info.forEach(info => {
    if (info.roomid != undefined) {
      recordStatus(info.roomid, info.liveStatus, false)
      recordTitle(info.roomid, info.title)
    }
  });
})
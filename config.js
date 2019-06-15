const Influx = require('influx')
module.exports = (username, password) => ({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username,
  password,
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
  }, {
    measurement: 'status',
    tags: ['lid'],
    fields: {
      status: Influx.FieldType.INTEGER,
      hard: Influx.FieldType.BOOLEAN
    }
  }, {
    measurement: 'title',
    tags: ['lid'],
    fields: {
      count: Influx.FieldType.STRING
    }
  }, {
    measurement: 'gift',
    tags: ['lid'],
    fields: {
      uid: Influx.FieldType.INTEGER,
      giftId: Influx.FieldType.INTEGER,
      coinType: Influx.FieldType.INTEGER,
      totalCoin: Influx.FieldType.INTEGER
    }
  }, {
    measurement: 'guard',
    tags: ['lid'],
    fields: {
      uid: Influx.FieldType.INTEGER,
      giftId: Influx.FieldType.INTEGER,
      num: Influx.FieldType.INTEGER,
      price: Influx.FieldType.INTEGER,
      level: Influx.FieldType.INTEGER
    }
  }]
})

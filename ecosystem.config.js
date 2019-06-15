module.exports = {
  apps: [{
    name: 'eagle',
    script: 'rec.js',
    instances: 1,
    autorestart: true,
    watch: false
  }, {
    name: 'falcon',
    script: 'read.js',
    instances: 1,
    autorestart: true,
    watch: false
  }]
}

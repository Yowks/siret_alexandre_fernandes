module.exports = {
  apps : [{
    name: 'siret',
    script: './app/controllers/convert.js',
    instances: 4,
    autorestart: false,
    watch: false,
    max_memory_restart: '1G'
  }]
}
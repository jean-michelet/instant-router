const http = require('http')
const router = require('find-my-way')()

const MAX = 500
for (let i = 1; i <= MAX; i++) {
  router.on('GET', `/foo/${i}/:id(\\d+)`, (req, res, params) => {
    res.end('Response from find-my-way')
  })
}

const server = http.createServer((req, res) => {
  router.lookup(req, res)
})

server.listen(3002, err => {
  if (err) throw err
  console.log('Server listening on: http://localhost:3002')
})
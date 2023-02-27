const finalhandler = require('finalhandler')
const http         = require('http')
const Router       = require('router')

const router = Router()
router.get('/', function (req, res) {
  res.end('Response from express-router')
})

const MAX = 500
for (let i = 1; i <= MAX; i++) {
  router.get(`/foo/${i}/:id(\\d+)`, (req, res, params) => {
    res.end('Response from express-router')
  })
}

const server = http.createServer(function(req, res) {
  router(req, res, finalhandler(req, res))
})

server.listen(3001)
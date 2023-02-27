const http = require('http');
const {default: Router, RequestContext} = require('../dist/index.js');

const router = new Router()

const MAX = 500
for (let i = 1; i <= MAX; i++) {
    router.addRoute({
        path: `/foo/${i}/:id`,
        methods: "GET",
        requirements: { id: "\\d+" },
        controller: (req, res) => res.end("Response from my-router")
    })
}

const server = http.createServer(function(req, res) {
    const node = router.match(RequestContext.fromIncomingMessage(req))
    node.controller(req, res)
})

server.listen(3000)
import http, { IncomingMessage, ServerResponse } from 'node:http'
import ResourceNotFound from '../errors/ResourceNotFound'
import RequestContext from '../RequestContext'
import Router from '../Router'
import { ControllerFunction } from '../RouteDefinition'
import MethodNotAllowedError from '../errors/MethodNotAllowedError'

const router = new Router()

const routes = [
  { path: "/", 
    methods: ["GET"], 
    controller: (req: IncomingMessage, res: ServerResponse) => res.end("Hello, World!") 
  },

  { path: "/user/:id", 
    methods: ["GET"], 
    requirements: { id: "\\d+" }, 
    controller: (req: IncomingMessage, res: ServerResponse) => res.end("Hello Jean!") }
]

routes.forEach(route => router.addRoute(route))

http.createServer((req, res) => {
  const context = RequestContext.fromIncomingMessage(req);
  try {
    const node = router.match(context);
    (node.controller as ControllerFunction)(req, res);
  } catch (error) {
    console.error(error)
    if (error instanceof ResourceNotFound) {
      res.writeHead(404);
      res.end('404 - Resource not found');
    } else if (error instanceof MethodNotAllowedError) {
      res.writeHead(405);
      res.end(`405 - Method ${context.method} not allowed`);
    } else {
      res.writeHead(500);
      res.end('500 - Internal server error');
    }
  }
}).listen(3000)

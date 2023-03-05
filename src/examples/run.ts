import http from 'node:http'
import RequestContext from '../RequestContext'

http.createServer((req, res) => {
  const context = RequestContext.fromIncomingMessage(req)

  console.log(context.path) // "/users/1"
  console.log(context.method) // "POST"
})

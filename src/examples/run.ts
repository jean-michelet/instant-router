import RequestContext from "../RequestContext"
import http from 'node:http';

http.createServer((req, res) => {
    const context = RequestContext.fromIncomingMessage(req)

    console.log(context.path) // "/users/1"
    console.log(context.method) // "POST"
})
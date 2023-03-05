# [BETA] Instant Router

Ultra fast router to match incoming HTTP requests.

* Uses a radix tree datastructure.
* Highly optimized to match static routes, [check the benchmarks](#benchmarks). 
* Doesn't contain middlewares.

## Summary

- [Install](#install)
- [Usage](#usage)
- [Router class](#router-class)
  * [Adding routes](#adding-routes)
  * [Matching](#matching)
- [RequestContext class](#requestcontext-class)
- [Benchmarks](#benchmarks)


## Install

```
npm install instant-router
```

```
yarn add instant-router
```

## Usage
```js
// Common JS
// const { Router, MethodNotAllowedError, RequestContext, ResourceNotFound} = require("instant-router")
// const http = require("http")

import { Router, MethodNotAllowedError, RequestContext, ResourceNotFound } from 'instant-router';
import http from 'node:http';

const routes = [
  {
    path: '/static',
    methods: ['GET'],
    controller: (req, res) => res.end('Hello, World!')
  },
  {
    path: '/users/:name',
    methods: ['GET'],
    requirements: { name: '[a-zA-Z]+' },
    controller: (req, res) => res.end(`Hello ${req.params.name}!`)
  }
]

const router = new Router()
routes.forEach(route => router.addRoute(route))

http.createServer((req, res) => {
  const context = RequestContext.fromIncomingMessage(req)
  try {
    const { controller, params } = router.match(context);

    controller({ ...req, params }, res)
  } catch (error) {
    console.error(error)
    if (error instanceof ResourceNotFound) {
      res.writeHead(404)
      res.end('404 - Resource not found')
    } else if (error instanceof MethodNotAllowedError) {
      res.writeHead(405)
      res.end(`405 - Method ${context.method} not allowed`)
    } else {
      res.writeHead(500)
      res.end('500 - Internal server error')
    }
  }
}).listen(3000, () => console.log('Listening on localhost:3000'))
```

:arrow_up::arrow_up::arrow_up: [Go back to summary](#summary)

### With TypeScript
```ts
import { Router, MethodNotAllowedError, RequestContext, ResourceNotFound } from 'instant-router'
import http, { IncomingMessage, ServerResponse } from 'http'

interface MyIncomingMessage extends IncomingMessage {
  params: { [paramName: string]: string | number }
}

const routes = [
  {
    path: '/static',
    methods: ['GET'],
    controller: (req: IncomingMessage, res: ServerResponse) => res.end('Hello, World!')
  },
  {
    path: '/users/:name',
    methods: ['GET'],
    requirements: { name: '[a-zA-Z]+' },
    controller: (req: MyIncomingMessage, res: ServerResponse) => res.end(`Hello ${req.params.name}!`)
  }
]

const router = new Router()
routes.forEach(route => router.addRoute(route))

http.createServer((req, res) => {
  const context = RequestContext.fromIncomingMessage(req)
  try {
    const { controller, params } = router.match(context);

    (controller as Function)({ ...req, params }, res)
  } catch (error) {
    console.error(error)
    if (error instanceof ResourceNotFound) {
      res.writeHead(404)
      res.end('404 - Resource not found')
    } else if (error instanceof MethodNotAllowedError) {
      res.writeHead(405)
      res.end(`405 - Method ${context.method} not allowed`)
    } else {
      res.writeHead(500)
      res.end('500 - Internal server error')
    }
  }
}).listen(3000, () => console.log('Listening on localhost:3000'))
```

:arrow_up::arrow_up::arrow_up: [Go back to summary](#summary)

## Router class

### Adding routes
To add a route, you must use the `addRoute` method.

Example:
```js
router.addRoute({
  path: '/users/:id',
  methods: ['GET'],
  requirements: { name: '\\d+' },
  controller: (req, res) => res.end("Matched!")
})
```

#### **path**
  * Should be a string that represents the URL path for the route. 
  * Can contain parameters in the format of `/my-path/:parameterName`.
  * Parameters in the URL path can be constrained by a regex using the `requirements` property.

#### **methods**
  * Should be a string or an array of strings that represents the HTTP methods.
  * Valid methods are defined automatically via the route configuration or explicitly using the `addMethods` method.

#### **requirements**
  * Is an optional object that defines validation requirements for parameters in the URL path.
  * Keys (parameter name) and values (regex) must be of type string.

:warning: The router automatically adds the start and end delimiters, do not add them by yourself. 

Bad: `"^\\d+$"`, good: `"\\d+"`

#### **controller**
  * Should be a function that represents the handler for the route.
  * Takes two arguments supposed to represent the request and the response. Note that it will be your responsibility to call the controller.

#### TypeScript interface of **`RouteDefinition`**:
```ts
interface RouteDefinition {
  path: string
  methods: string | string[]
  controller: ((req: any, res: any) => void)
  requirements?: { [paramName: string]: string }
}
```

:arrow_up::arrow_up::arrow_up: [Go back to summary](#summary)

### Matching
To try to match a route from an HTTP request, you must use the `match` method.

Example:
```js
const context = new RequestContext('/users/:id', 'GET')
const { controller, params } = router.match(context);
```

The `RequestContext` class help you to pass relevant HTTP request data 
to the `match` method. You can read its documentation [here](#requestcontext-class).

Currently, the `match` method returns a `TreeNode`, but this will no longer be the case 
from the first stable release. You will still have access to `controller` and `params` though.

#### Errors
  * If the requets HTTP method does not match any existing route, a `MethodNotAllowedError` is triggered.
  * If no route is matched, a `ResourceNotFound` error is triggered.

See [`Usage`](#usage) for examples.

:arrow_up::arrow_up::arrow_up: [Go back to summary](#summary)

## RequestContext class
The `RequestContext` class help you to pass relevant HTTP request data to the `match` method.

## RequestContext class

### Usage:
```js
import { IncomingMessage } from 'http'
import RequestContext from './RequestContext'

const req = new IncomingMessage()
req.url = '/users/1'
req.method = 'POST'

const context = RequestContext.fromIncomingMessage(req)

console.log(context.path) // "/users/1"
console.log(context.method) // "POST"
```

By default, `RequestContext` supports only the following http methods:
```
GET, HEAD, POST, PUT, DELETE, CONNECT, OPTIONS, TRACE, PATCH
```

But you can add more freely via the static property `availableHttpMethods`:
```js
RequestContext.availableHttpMethods.push("FOO")

const context = new RequestContext("/hello", "FOO")
console.log(context.method) // "FOO"
```

:arrow_up::arrow_up::arrow_up: [Go back to summary](#summary)

## Benchmarks
Benchmark comparisons, adapted from: [https://github.com/delvedor/router-benchmark/tree/master/benchmarks](https://github.com/delvedor/router-benchmark/tree/master/benchmarks)

### Machine
linux x64 | 8 vCPUs | 7.6GB Mem

### Software versions
- node: 18.14.2

```
=====================
 instant-router benchmark
=====================
short static: 232,598,222 ops/sec
static with same radix: 56,142,144 ops/sec
dynamic route: 3,162,154 ops/sec
mixed static dynamic: 3,150,744 ops/sec
long static: 55,622,346 ops/sec
all together: 1,380,149 ops/sec

=======================
 find-my-way benchmark
=======================
short static: 17,099,450 ops/sec
static with same radix: 6,243,196 ops/sec
dynamic route: 3,293,502 ops/sec
mixed static dynamic: 4,176,557 ops/sec
long static: 3,863,775 ops/sec
all together: 876,926 ops/sec

=======================================================
 express router benchmark (WARNING: includes handling)
=======================================================
short static: 2,111,590 ops/sec
static with same radix: 1,832,877 ops/sec
dynamic route: 1,087,600 ops/sec
mixed static dynamic: 831,342 ops/sec
long static: 860,493 ops/sec
all together: 221,828 ops/sec
```

:arrow_up::arrow_up::arrow_up: [Go back to summary](#summary)
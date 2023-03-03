# [WIP] FF Router

Ultra fast router using RadixTree data structure to match incoming HTTP requests.

Although this router includes unit tests and benchmarks, its initial development 
is intended to serve as a learning material. 

I recommend to use [`find-my-way`](https://www.npmjs.com/package/find-my-way), an extremely powerful router.

This router does not include middleware functionality, unlike many Node frameworks. 
This is a personal design choice, I consider that a router is only dedicated to match an http request and a server resource (route).

## Usage

```ts
interface MyIncomingMessage extends IncomingMessage {
  params: { [paramName: string]: string | number }
}

const routes = [
  { path: "/", 
    methods: ["GET"], 
    controller: (req: IncomingMessage, res: ServerResponse) => res.end("Hello, World!") 
  },
  { path: "/users/:name", 
    methods: ["GET"], 
    requirements: { name: "[a-zA-Z]+" }, 
    controller: (req: MyIncomingMessage, res: ServerResponse) => res.end(`Hello ${req.params.name}!`) }
]

const router = new Router()
routes.forEach(route => router.addRoute(route))

http.createServer((req, res) => {
  const context = RequestContext.fromIncomingMessage(req);
  try {
    const { controller, params } = router.match(context);

    (controller as Function)({...req, params}, res);
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
}).listen(3000, () => console.log("Listening on localhost:3000"))

```

## Benchmarks
Benchmark comparisons, adapted from: [https://github.com/delvedor/router-benchmark/tree/master/benchmarks](https://github.com/delvedor/router-benchmark/tree/master/benchmarks)

### Machine
linux x64 | 8 vCPUs | 7.6GB Mem

### Software versions
- node: 18.14.2

```
=======================
 find-my-way benchmark
=======================
short static: 17,099,450 ops/sec
static with same radix: 6,243,196 ops/sec
dynamic route: 3,293,502 ops/sec
mixed static dynamic: 4,176,557 ops/sec
long static: 3,863,775 ops/sec
all together: 876,926 ops/sec

=====================
 ff-router benchmark
=====================
short static: 232,598,222 ops/sec
static with same radix: 56,142,144 ops/sec
dynamic route: 3,162,154 ops/sec
mixed static dynamic: 3,150,744 ops/sec
long static: 55,622,346 ops/sec
all together: 1,380,149 ops/sec

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
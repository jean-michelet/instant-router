# [WIP] FF Router

Ultra fast router using RadixTree data structure to match incoming HTTP requests.

Although this router includes unit tests and benchmarks, its initial development 
is intended to serve as a learning material. 

I recommend to use [`find-my-way`](https://www.npmjs.com/package/find-my-way), an extremely powerful router.

This router does not include middleware functionality, unlike many Node frameworks. 
This is a personal design choice, I consider that a router is only dedicated to match an http request and a server resource (route), not the life cycle of an HTTP request.

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
Benchmark comparisons, adapted script from: [https://github.com/delvedor/router-benchmark/tree/master/benchmarks](https://github.com/delvedor/router-benchmark/tree/master/benchmarks)


### Machine
linux x64 | 8 vCPUs | 7.6GB Mem

### Software versions
- node: 18.14.2

```
=======================
 find-my-way benchmark
=======================
short static: 16,564,452 ops/sec
static with same radix: 5,510,309 ops/sec
dynamic route: 3,411,527 ops/sec
mixed static dynamic: 4,262,101 ops/sec
long static: 3,774,220 ops/sec
all together: 879,332 ops/sec

=====================
 ff-router benchmark
=====================
short static: 7,580,146 ops/sec
static with same radix: 6,958,251 ops/sec
dynamic route: 3,042,458 ops/sec
mixed static dynamic: 3,336,445 ops/sec
long static: 4,035,197 ops/sec
all together: 806,509 ops/sec

=======================================================
 express router benchmark (WARNING: includes handling)
=======================================================
short static: 2,068,838 ops/sec
static with same radix: 1,793,668 ops/sec
dynamic route: 1,090,216 ops/sec
mixed static dynamic: 848,040 ops/sec
long static: 881,352 ops/sec
all together: 225,932 ops/sec
```
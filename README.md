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
short static: 16,757,627 ops/sec
static with same radix: 6,342,316 ops/sec
dynamic route: 3,409,237 ops/sec
mixed static dynamic: 4,071,355 ops/sec
long static: 3,489,597 ops/sec
all together: 876,341 ops/sec

=====================
 ff-router benchmark
=====================
short static: 9,636,848 ops/sec
static with same radix: 7,404,884 ops/sec
dynamic route: 3,235,661 ops/sec
mixed static dynamic: 3,337,301 ops/sec
long static: 4,296,122 ops/sec
all together: 835,496 ops/sec

=======================================================
 express router benchmark (WARNING: includes handling)
=======================================================
short static: 2,089,905 ops/sec
static with same radix: 1,824,541 ops/sec
dynamic route: 1,074,232 ops/sec
mixed static dynamic: 754,256 ops/sec
long static: 844,073 ops/sec
all together: 218,512 ops/sec
```
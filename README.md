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
short static: 17,723,455 ops/sec
static with same radix: 6,224,968 ops/sec
dynamic route: 3,360,066 ops/sec
mixed static dynamic: 4,216,977 ops/sec
long static: 3,886,751 ops/sec
all together: 892,559 ops/sec

=====================
 ff-router benchmark
=====================
short static: 201,906,767 ops/sec
static with same radix: 6,277,241 ops/sec
dynamic route: 3,028,602 ops/sec
mixed static dynamic: 3,229,052 ops/sec
long static: 3,831,582 ops/sec
all together: 883,231 ops/sec

=======================================================
 express router benchmark (WARNING: includes handling)
=======================================================
short static: 2,075,206 ops/sec
static with same radix: 1,810,499 ops/sec
dynamic route: 1,048,300 ops/sec
mixed static dynamic: 813,732 ops/sec
long static: 812,441 ops/sec
all together: 222,967 ops/sec
```

### Reproduction 1
```
=======================
 find-my-way benchmark
=======================
short static: 17,998,336 ops/sec
static with same radix: 6,097,122 ops/sec
dynamic route: 3,274,554 ops/sec
mixed static dynamic: 4,079,127 ops/sec
long static: 3,804,978 ops/sec
all together: 865,217 ops/sec

=====================
 ff-router benchmark
=====================
short static: 269,748,780 ops/sec
static with same radix: 6,417,489 ops/sec
dynamic route: 2,916,484 ops/sec
mixed static dynamic: 3,127,646 ops/sec
long static: 3,743,171 ops/sec
all together: 853,098 ops/sec

=======================================================
 express router benchmark (WARNING: includes handling)
=======================================================
short static: 2,108,819 ops/sec
static with same radix: 1,764,621 ops/sec
dynamic route: 1,059,099 ops/sec
mixed static dynamic: 831,172 ops/sec
long static: 846,217 ops/sec
all together: 222,060 ops/sec
```

### Reproduction 2
```
=======================
 find-my-way benchmark
=======================
short static: 13,973,598 ops/sec
static with same radix: 6,243,764 ops/sec
dynamic route: 3,192,931 ops/sec
mixed static dynamic: 4,260,069 ops/sec
long static: 3,929,062 ops/sec
all together: 886,502 ops/sec

=====================
 ff-router benchmark
=====================
short static: 189,466,173 ops/sec
static with same radix: 6,423,858 ops/sec
dynamic route: 2,952,970 ops/sec
mixed static dynamic: 3,244,269 ops/sec
long static: 3,814,081 ops/sec
all together: 848,851 ops/sec

=======================================================
 express router benchmark (WARNING: includes handling)
=======================================================
short static: 2,126,727 ops/sec
static with same radix: 1,826,615 ops/sec
dynamic route: 1,052,507 ops/sec
mixed static dynamic: 802,478 ops/sec
long static: 856,572 ops/sec
all together: 225,669 ops/sec
```
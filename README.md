# Routing

Ultra fast router using RadixTree data structure to match incoming HTTP requests.

## Usage

```ts
import Router from "./Router";
import { RouteDefinition } from "./Route";

const router = new Router()

const routes: RouteDefinition[] = [
  { path: "/", methods: ["GET"], controller: (req, res) => res.end("Hello, World!") },
  { path: "/user/:id", methods: ["GET"], requirements: { id: "\\d+" }, controller: getUserController }
]

routes.forEach(route => router.addRoute(route))

http.createServer((req, res) => {
  const context = RequestContext.fromIncomingMessage(req);
  try {
    const node = router.findNode(context.path, context.method);
    node.controller(req, res, node.params);
  } catch (error) {
    if (error instanceof ResourceNotFound) {
      res.writeHead(404);
      res.end('404 - Resource not found');
    } else if (error instanceof MethodNotAllowedError) {
      res.writeHead(405);
      res.end(`405 - Method ${error.method} not allowed`);
    } else {
      res.writeHead(500);
      res.end('500 - Internal server error');
    }
  }
});
```

## benchmarks
Some benchmark comparisons with some famous routers:
* [`router`](https://www.npmjs.com/package/router)
* [`find-my-way`](https://www.npmjs.com/package/find-my-way) (reputed ultra fast)

### Context
The performances of the routers have been measured in a http server context created by the module [http](https://nodejs.org/api/http.html). cf. `/benchmarks`

### Machine
linux x64 | 8 vCPUs | 7.6GB Mem

### Software versions
- node: 18.14.2
- autocannon: 7.10.0

The benchmark tool that has been used is [`autocanon`](https://github.com/mcollina/autocannon#usage) using the following command line:
```bash
autocannon -c 100 -d 40 -p 10 localhost:3000
```
Inspired by: [Fastify Benchmarks](https://github.com/fastify/benchmarks#benchmarks)

### Testing strategy
For each router, 500 routes are generated with the following characteristics:
* the http method used is GET.
* the paths take the following form `/foo/${i}/:id` where `i` is between 0 and 500 and `:id` must match the regex `\d+`

3 tests are performed:
* GET /foo/1/555
* GET /foo/250/555
* GET /foo/500/555

### Benchmark results:
> Need to be reproduced

#### Test 1
|              | Version | Requests/s | Latency (ms) | Throughput/Mb |
| :--          | --:     | :-:        | --:          | --:           |
| find-my-way  | 7.5.0   | 54641.6    | 17.18        | 8.09          |
| ff-router    | 1.0.0   | 49646.4    | 19.63        | 7.25          |
| router       | 1.3.8   | 42231.8    | 65.61        | 6.38          |


#### Test 2
|              | Version | Requests/s | Latency (ms) | Throughput/Mb |
| :--          | --:     | :-:        | --:          | --:           |
| ff-router    | 1.0.0   | 46483.2    | 21.02        | 6.79          |
| find-my-way  | 7.5.0   | 24258.9    | 40.73        | 3.59          |
| router       | 1.3.8   | 17898.6    | 55.34        | 2.7           |


#### Test 3
|              | Version | Requests/s  | Latency (ms) | Throughput/Mb |
| :--          | --:     | :-:         | --:          | --:           |
| find-my-way  | 7.5.0   | 23485.68    | 41.26        | 3.48          |
| ff-router    | 1.0.0   | 23302.85    | 42.34        | 3.4           |
| router       | 1.3.8   | 10325.05    | 96.26        | 1.56          |
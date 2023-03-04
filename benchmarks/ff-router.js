
'use strict'

const { title, now, print, operations } = require('./utils')
const { Router } = require('../dist/index.js');

const router = new Router()

title('ff-router benchmark')

const routes = [
  { methods: 'GET', path: '/user' },
  { methods: 'GET', path: '/user/comments' },
  { methods: 'GET', path: '/user/avatar' },
  { methods: 'GET', path: '/user/lookup/username/:username' },
  { methods: 'GET', path: '/user/lookup/email/:address' },
  { methods: 'GET', path: '/event/:id' },
  { methods: 'GET', path: '/event/:id/comments' },
  { methods: 'POST', path: '/event/:id/comment' },
  { methods: 'GET', path: '/map/:location/events' },
  { methods: 'GET', path: '/status' },
  { methods: 'GET', path: '/very/deeply/nested/route/hello/there' }
]

function noop () {}
let time = 0

routes.forEach(({ methods, path }) => {
  router.addRoute({ methods, path, controller: noop})
})

time = now()
for (let i = 0; i < operations; i++) {
  router.match({ method: 'GET', path: '/user'})
}
print('short static:', time)

time = now()
for (let i = 0; i < operations; i++) {
  router.match({ method: 'GET', path: '/user/comments'})
}
print('static with same radix:', time)

time = now()
for (let i = 0; i < operations; i++) {
  router.match({ method: 'GET', path: '/user/lookup/username/john'})
}
print('dynamic route:', time)

time = now()
for (let i = 0; i < operations; i++) {
  router.match({ method: 'GET', path: '/event/abcd1234/comments'})
}
print('mixed static dynamic:', time)

time = now()
for (let i = 0; i < operations; i++) {
  router.match({ method: 'GET', path: '/very/deeply/nested/route/hello/there'})
}
print('long static:', time)

time = now()
for (let i = 0; i < operations; i++) {
  router.match({ method: 'GET', path: '/user'})
  router.match({ method: 'GET', path: '/user/comments'})
  router.match({ method: 'GET', path: '/user/lookup/username/john'})
  router.match({ method: 'GET', path: '/event/abcd1234/comments'})
  router.match({ method: 'GET', path: '/very/deeply/nested/route/hello/there'})
}
print('all together:', time)

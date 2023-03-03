import { TREE_NODE_DEFAULT_REGEX } from '../RadixTreeRouter'
import RequestContext from '../RequestContext'
import Router from '../Router'
import MethodNotAllowedError from '../errors/MethodNotAllowedError'
import ResourceNotFound from '../errors/ResourceNotFound'

describe('Router', () => {
  let router: Router

  beforeEach(() => {
    router = new Router()
  })

  describe('addRoute', () => {
    it('should add a route for each specified method', () => {
      router.addRoute({
        path: '/',
        methods: ['GET', 'POST'],
        controller: () => {}
      })

      expect(router.match(new RequestContext('/', 'GET'))).toBeTruthy()
      expect(router.match(new RequestContext('/', 'POST'))).toBeTruthy()
    })

    it('should add a route for a single method', () => {
      router.addRoute({
        path: '/',
        methods: 'GET',
        controller: () => {}
      })

      expect(router.match(new RequestContext('/', 'GET'))).toBeTruthy()
    })
  })

  describe('addMethod', () => {
    it('should add a new RadixTreeRouter for a new method', () => {
      expect(router._radixTrees).toEqual({})

      router.addMethod('GET')

      expect(router._radixTrees).toEqual({
        GET: expect.anything()
      })
    })

    it('should not add a new RadixTreeRouter for an existing method', () => {
      expect(router._radixTrees).toEqual({})

      router.addMethod('GET')
      router.addMethod('GET')

      expect(router._radixTrees).toEqual({
        GET: expect.anything()
      })
    })
  })

  describe('match', () => {
    it('should throw a MethodNotAllowedError if the method is not allowed', () => {
      expect(() => {
        router.match(new RequestContext('/', 'GET'))
      }).toThrow(MethodNotAllowedError)
    })

    it('should throw a ResourceNotFound error if no path exists for the specified string', () => {
      router.addRoute({
        path: '/',
        methods: 'GET',
        controller: () => {}
      })

      expect(() => {
        router.match(new RequestContext('/invalid', 'GET'))
      }).toThrow(ResourceNotFound)
    })

    it('should return the matched TrieNode', () => {
      const controller = () => {}
      router.addRoute({
        path: '/users/:id',
        methods: 'GET',
        controller
      })

      const node = router.match(new RequestContext('/users/123', 'GET'))

      expect(node).toEqual({
        name: ':id',
        fullName: '/users/:id',
        isPath: true,
        isParam: true,
        children: [],
        params: { id: '123' },
        regex: TREE_NODE_DEFAULT_REGEX,
        controller
      })
    })
  })
})

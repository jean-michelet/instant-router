import RadixTreeRouter, { TREE_NODE_DEFAULT_REGEX } from '../RadixTreeRouter'
import RouteDefinition from '../RouteDefinition'

describe('RadixTreeRouter', () => {
  describe('addRouteNode', () => {
    let router: RadixTreeRouter

    beforeEach(() => {
      router = new RadixTreeRouter()
    })

    it('should add a new route node to an empty trie', () => {
      router.addRouteNode({ path: '/test', methods: 'GET', controller: () => {} })

      expect(router.root.children[0]).toEqual({
        name: 'test',
        fullName: '/test',
        isPath: true,
        isParam: false,
        children: [],
        controller: expect.any(Function)
      })
    })

    it('should add two new route nodes to an empty trie', () => {
      router.addRouteNode({ path: '/test', methods: 'GET', controller: () => {} })
      router.addRouteNode({ path: '/test2', methods: 'GET', controller: () => {} })

      expect(router.root.children).toHaveLength(2)
    })

    it('should add a new route node with parameters to the trie', () => {
      router.addRouteNode({ path: '/users/:id', methods: 'GET', controller: () => {} })

      expect(router.root.children[0]).toEqual({
        name: 'users',
        fullName: '/users',
        isPath: false,
        isParam: false,
        children: [
          {
            name: ':id',
            fullName: '/users/:id',
            isPath: true,
            isParam: true,
            regex: TREE_NODE_DEFAULT_REGEX,
            children: [],
            controller: expect.any(Function)
          }
        ]
      })
    })

    it('should add a new route node with parameter requirements to the trie', () => {
      router.addRouteNode({
        path: '/users/:id',
        methods: 'GET',
        requirements: { id: '\\d+' },
        controller: () => {}
      })

      expect(router.root.children[0]).toEqual({
        name: 'users',
        fullName: '/users',
        isPath: false,
        isParam: false,
        children: [
          {
            name: ':id',
            fullName: '/users/:id',
            isPath: true,
            isParam: true,
            regex: /^\d+$/,
            children: [],
            controller: expect.any(Function)
          }
        ]
      })
    })

    it('should add a new route node with multiple parts to the trie', () => {
      router.addRouteNode({ path: '/users/:id/posts/:postId', methods: 'GET', controller: () => {} })

      expect(router.root.children).toHaveLength(1)
      expect(router.root.children[0]).toMatchObject({
        name: 'users',
        fullName: '/users',
        isPath: false,
        isParam: false,
        children: [
          {
            name: ':id',
            fullName: '/users/:id',
            isPath: false,
            isParam: true,
            regex: TREE_NODE_DEFAULT_REGEX,
            children: [
              {
                name: 'posts',
                fullName: '/users/:id/posts',
                isPath: false,
                isParam: false,
                children: [
                  {
                    name: ':postId',
                    fullName: '/users/:id/posts/:postId',
                    isPath: true,
                    isParam: true,
                    regex: TREE_NODE_DEFAULT_REGEX,
                    children: [],
                    controller: expect.any(Function)
                  }
                ]
              }
            ]
          }
        ]
      })
    })

    it('should add a new route node with multiple parts to the trie and multiple requirements', () => {
      const requirements = {
        id: '\\d+',
        slug: '[a-z0-9-]+'
      }
      const route = {
        path: '/users/:id/:slug',
        methods: 'GET',
        controller: () => {},
        requirements
      }

      router.addRouteNode(route)

      expect(router.root.children[0]).toEqual({
        name: 'users',
        fullName: '/users',
        isPath: false,
        isParam: false,
        children: [
          {
            name: ':id',
            fullName: '/users/:id',
            isPath: false,
            isParam: true,
            regex: /^\d+$/,
            children: [
              {
                name: ':slug',
                fullName: '/users/:id/:slug',
                isPath: true,
                isParam: true,
                children: [],
                regex: /^[a-z0-9-]+$/,
                controller: expect.any(Function)
              }
            ]
          }
        ]
      })
    })
  })

  describe('match', () => {
    it('should match a path with no params', () => {
      const router = new RadixTreeRouter()
      router.addRouteNode({ path: '/home', methods: 'GET', controller: () => {} })

      const node = router.find('/home')
      expect(node.name).toEqual('home')
    })

    it('should match a path with a single param', () => {
      const router = new RadixTreeRouter()
      router.addRouteNode({ path: '/users/:id', methods: 'GET', controller: () => {} })

      const node = router.find('/users/123')
      expect(node.name.slice(1)).toEqual('id')
      expect(node.params).toEqual({ id: '123' })
    })

    it('should not using the same name property for both the parameter node and the static node', () => {
      const router = new RadixTreeRouter()
      router.addRouteNode({ path: '/:id/1', methods: 'GET', controller: () => {} })
      router.addRouteNode({ path: '/:id/2', methods: 'GET', controller: () => {} })

      const node = router.find('/123/2')
      expect(node.params).toEqual({ id: '123' })
    })

    it('should match a path with multiple params', () => {
      const router = new RadixTreeRouter()
      router.addRouteNode({ path: '/users/:userId/posts/:postId', methods: 'GET', controller: () => {} })

      const node = router.find('/users/123/posts/456')
      expect(node.name.slice(1)).toEqual('postId')
      expect(node.params).toEqual({ userId: '123', postId: '456' })
    })

    it('should match a path with a param that meets requirements', () => {
      const router = new RadixTreeRouter()
      router.addRouteNode({ path: '/users/:id', methods: 'GET', controller: () => {}, requirements: { id: '\\d+' } })

      const node = router.find('/users/123')
      expect(node.name.slice(1)).toEqual('id')
      expect(node.params).toEqual({ id: '123' })
    })

    it('should prioritize static routes over dynamic routes', () => {
      const router = new RadixTreeRouter()
      router.addRouteNode({path: '/users/:userId', methods: "GET", controller: () => {}})
      router.addRouteNode({path: '/users/profile', methods: "GET", controller: () => {}})

      const node = router.find('/users/profile')
      expect(node.params).toBe(undefined)
      expect(node.fullName).toBe('/users/profile')
    })

    it('should throws an error when no path exists for the given string', () => {
      const router = new RadixTreeRouter()
      router.addRouteNode({ path: '/hello/world', methods: 'GET', controller: () => {} })
      expect(() => router.find('/hello')).toThrow("No path exists for string '/hello'")
    })

    it('should throws an error when a node cannot be matched with a part', () => {
      const router = new RadixTreeRouter()
      router.addRouteNode({ path: '/hello/:name', methods: 'GET', controller: () => {} })
      expect(() => router.find('/hello/')).toThrow("Could not match node with part ''")
    })

    it('should throws an error when a param value does not match its regex', () => {
      const router = new RadixTreeRouter()
      router.addRouteNode({ path: '/users/:id', requirements: { id: '\\d+' }, methods: 'GET', controller: () => {} })
      expect(() => router.find('/users/abc')).toThrow("Could not match node with part 'abc'")
    })
  })
})

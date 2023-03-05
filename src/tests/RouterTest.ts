import { TREE_NODE_DEFAULT_REGEX } from '../RadixTreeRouter'
import RequestContext from '../RequestContext'
import RouteDefinition from '../RouteDefinition'
import Router, { routerConfiguration } from '../Router'
import UrlGenerator from '../UrlGenerator'
import MethodNotAllowedError from '../errors/MethodNotAllowedError'
import ResourceNotFound from '../errors/ResourceNotFound'

describe('Router', () => {
  let router: Router

  beforeEach(() => {
    router = new Router()
  })

  describe('constructor', () => {
    it('should create a new Router instance', () => {
      const router = new Router();
      expect(router).toBeInstanceOf(Router);
    });

    it('should create a new Router instance with custom UrlGenerator options if provided', () => {
      const options: routerConfiguration = {
        urlGenerator: {
          isAbsolute: true,
          scheme: 'https',
          host: 'example.com',
          port: 443
        }
      };

      const router = new Router(options);
      expect(router['_urlGenerator']['_options']).toEqual(options.urlGenerator);
    });
  });

  describe('generateUrl', () => {
    it('should generate a URL with the provided name, parameters, and options', () => {
      const router = new Router();
      const route: RouteDefinition = {
        path: '/users/:id',
        methods: ['GET'],
        controller: () => {}
      };

      router.addNamedRoute('user', route);
      const generatedUrl = router.generateUrl('user', { id: 1 }, { isAbsolute: true });
      expect(generatedUrl).toBe('http://localhost:3000/users/1');
    });

    it('should generate a URL taking into account the default configuration passed from the router constructor', () => {
      const options: routerConfiguration = {
        urlGenerator: {
          isAbsolute: true,
          scheme: 'https',
          host: 'example.com',
          port: 443
        }
      };

      const router = new Router(options);
      const route: RouteDefinition = {
        path: '/users/:id',
        methods: ['GET'],
        controller: () => {}
      };

      router.addNamedRoute('user', route);
      const generatedUrl = router.generateUrl('user', { id: 1 });
      expect(generatedUrl).toBe('https://example.com:443/users/1');
    });

    it('should throw an error if the named route does not exist', () => {
      const router = new Router();
      expect(() => router.generateUrl('user', { id: 1 })).toThrowError('Named route "user" doesn\'t exist.');
    });
  });

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
      expect(router.radixTrees).toEqual({})

      router.addMethod('GET')

      expect(router.radixTrees).toEqual({
        GET: expect.anything()
      })
    })

    it('should not add a new RadixTreeRouter for an existing method', () => {
      expect(router.radixTrees).toEqual({})

      router.addMethod('GET')
      router.addMethod('GET')

      expect(router.radixTrees).toEqual({
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
      const controller = (): any => {}
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

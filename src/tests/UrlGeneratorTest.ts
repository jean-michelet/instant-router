import RouteDefinition from '../RouteDefinition'
import UrlGenerator, { urlGeneratorOptions } from '../UrlGenerator'
import MissingAbsoluteUrlGeneratorOption from '../errors/MissingAbsoluteUrlGeneratorOption'

function getUserRoute (): RouteDefinition {
  return {
    path: '/users/:userId',
    methods: ['GET'],
    controller: () => {}
  }
}

function getCommentsRoute (): RouteDefinition {
  return {
    path: '/posts/:postId/comments/:commentId',
    methods: ['GET'],
    controller: () => {}
  }
}

describe('UrlGenerator', () => {
  let generator: UrlGenerator
  const routes = new Map<string, RouteDefinition>()

  beforeEach(() => {
    generator = new UrlGenerator()
    routes.clear()
  })

  describe('addRoute', () => {
    it('should add a named route to the generator', () => {
      const route = getUserRoute()

      generator.addRoute('user', route)

      expect(generator.routes.size).toEqual(1)
      expect(generator.routes.get('user')).toBe(route)
    })
  })

  describe('generate', () => {
    beforeEach(() => {
      routes.set('user', getUserRoute())
      routes.set('comment', getCommentsRoute())

      generator.routes = routes
    })

    it('should generate a URL for a named route with no options', () => {
      const url = generator.generate('user', { userId: '123' })

      expect(url).toEqual('/users/123')
    })

    it('should generate a URL for a named route with absolute URL options', () => {
      const options: urlGeneratorOptions = {
        isAbsolute: true,
        scheme: 'https',
        host: 'example.com',
        port: 8080
      }

      const url = generator.generate('user', { userId: '123' }, options)

      expect(url).toEqual('https://example.com:8080/users/123')
    })

    it('should generate a URL with query parameters', () => {
      const url = generator.generate('user', { userId: '123', foo: 4, bar: 'baz' })

      expect(url).toEqual('/users/123?foo=4&bar=baz')
    })

    it('should throw an error for a missing named route', () => {
      expect(() => {
        generator.generate('invalidRoute')
      }).toThrowError('Named route "invalidRoute" doesn\'t exist.')
    })

    it('should throw an error for a missing parameter', () => {
      expect(() => {
        generator.generate('user')
      }).toThrowError('Missing parameter "userId"')
    })

    // also proove that port is optional
    it('should throw an error for missing absolute URL options', () => {
      const options: urlGeneratorOptions = {
        isAbsolute: true,
        scheme: 'https',
        host: undefined
      }

      expect(() => {
        generator.generate('user', { userId: '123' }, options)
      }).toThrowError(MissingAbsoluteUrlGeneratorOption)
    })

    it('should encode parameter values', () => {
      const url = generator.generate('user', { userId: '123 abc', foo: 'a word' })

      expect(url).toEqual('/users/123%20abc?foo=a%20word')
    })

    it('should handle multiple parameterized parts in a route', () => {
      const url = generator.generate('comment', { postId: '123', commentId: '456' })

      expect(url).toEqual('/posts/123/comments/456')
    })
  })
})

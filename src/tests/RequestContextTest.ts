import { IncomingMessage } from 'http'
import RequestContext from '../RequestContext'
import MethodNotAllowedError from '../errors/MethodNotAllowedError'

describe('RequestContext', () => {
  describe('constructor', () => {
    it('should create a new RequestContext with default values', () => {
      const context = new RequestContext()
      expect(context.path).toEqual('/')
      expect(context.method).toEqual('GET')
    })

    it('should create a new RequestContext with the provided values', () => {
      const context = new RequestContext('/users', 'POST')
      expect(context.path).toEqual('/users')
      expect(context.method).toEqual('POST')
    })
  })

  describe('fromIncomingMessage', () => {
    it('should create a new RequestContext from an IncomingMessage', () => {
      const req = { url: '/users', method: 'POST' }

      const context = RequestContext.fromIncomingMessage(req as IncomingMessage)
      expect(context.path).toEqual('/users')
      expect(context.method).toEqual('POST')
    })
  })

  describe('path', () => {
    it('should set the path to "/" if an empty string is passed', () => {
      const context = new RequestContext()
      context.path = ''
      expect(context.path).toEqual('/')
    })

    it('should add a leading "/" to the path if it is missing', () => {
      const context = new RequestContext()
      context.path = 'users'
      expect(context.path).toEqual('/users')
    })

    it('should remove trailing "/" characters from the path', () => {
      const context = new RequestContext()
      context.path = '/users//'
      expect(context.path).toEqual('/users')
    })
  })

  describe('method', () => {
    it('should set the method to uppercase', () => {
      const context = new RequestContext()
      context.method = 'post'
      expect(context.method).toEqual('POST')
    })

    it('should throw a MethodNotAllowedError if an invalid method is provided', () => {
      const context = new RequestContext()
      expect(() => {
        context.method = 'INVALID_METHOD'
      }).toThrow(MethodNotAllowedError)
    })
  })
})

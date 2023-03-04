import { IncomingMessage } from 'http'
import MethodNotAllowedError from './errors/MethodNotAllowedError'

export default class RequestContext {
  private _path: string = '/'
  private _method: string = 'GET'

  static availableHttpMethods: string[] = [
    'GET',
    'HEAD',
    'POST',
    'PUT',
    'DELETE',
    'CONNECT',
    'OPTIONS',
    'TRACE',
    'PATCH'
  ]

  constructor (path: string = '/', method: string = 'GET') {
    this.path = path
    this.method = method
  }

  static fromIncomingMessage (req: IncomingMessage): RequestContext {
    const context = new RequestContext()
    const { url, method } = req

    if (typeof url === 'string') {
      context.path = url
    }

    if (typeof method === 'string') {
      context.method = method
    }

    return context
  }

  get path (): string {
    return this._path
  }

  set path (path: string) {
    path = path.replace(/\/+$/, '')

    if (path === '' || !path.startsWith('/')) {
      path = `/${path}`
    }

    this._path = path
  }

  get method (): string {
    return this._method
  }

  set method (method: string) {
    method = method.toUpperCase()

    if (!RequestContext.availableHttpMethods.includes(method)) {
      throw new MethodNotAllowedError(method)
    }

    this._method = method
  }
}

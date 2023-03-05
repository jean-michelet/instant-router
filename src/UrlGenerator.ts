import RouteDefinition from './RouteDefinition'
import MissingAbsoluteUrlGeneratorOption from './errors/MissingAbsoluteUrlGeneratorOption'
import MissingParameterError from './errors/MissingParameterError'

export interface urlGeneratorOptions {
  isAbsolute?: boolean
  scheme?: string
  host?: string
  port?: number
}

export default class UrlGenerator {
  private _routes: Map<string, RouteDefinition> = new Map()

  private readonly _options: urlGeneratorOptions = {}

  private readonly _defaultOptions: urlGeneratorOptions = {
    isAbsolute: false,
    scheme: 'http',
    host: 'localhost',
    port: 3000
  }

  constructor (options: urlGeneratorOptions = {}) {
    this._options = { ...this._defaultOptions, ...options }
  }

  public get routes (): Map<string, RouteDefinition> {
    return this._routes
  }

  public set routes (routes: Map<string, RouteDefinition>) {
    this._routes = routes
  }

  public addRoute (name: string, route: RouteDefinition): void {
    this._routes.set(name, route)
  }

  public generate (name: string, parameters: { [paramName: string]: string | number } = {}, options: urlGeneratorOptions = {}): string {
    if (!this._routes.has(name)) {
      throw new Error(`Named route "${name}" doesn't exist.`)
    }

    const opts = { ...this._options, ...options }

    const route = this._routes.get(name) as RouteDefinition

    let url = ''
    if (opts.isAbsolute !== undefined && opts.isAbsolute) {
      for (const [name, value] of Object.entries(opts)) {
        if (value === undefined && name !== 'port') {
          throw new MissingAbsoluteUrlGeneratorOption(name)
        }
      }

      url += `${opts.scheme as string}://${opts.host as string}`
      if (opts.port !== undefined) {
        url += `:${opts.port}`
      }
    }

    let path = route.path
    if (!path.startsWith('/')) {
      path = `/${path}`
    }

    const parts = path.split('/')
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].startsWith(':')) {
        const paramName = parts[i].slice(1)
        if (!Object.prototype.hasOwnProperty.call(parameters, paramName)) {
          throw new MissingParameterError(paramName)
        }

        parts[i] = encodeURIComponent(parameters[paramName])
        delete parameters[paramName]
      }
    }

    url = url + parts.join('/')

    const queryParameters = Object.entries(parameters)
    if (queryParameters.length > 0) {
      url += '?'

      const encodedParams = []
      for (const [name, value] of queryParameters) {
        encodedParams.push(`${name}=${encodeURIComponent(value)}`)
      }

      url += encodedParams.join('&')
    }

    return url
  }
}

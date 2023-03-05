import RadixTrieRouter, { TreeNode } from './RadixTreeRouter'
import RequestContext from './RequestContext'
import RouteDefinition from './RouteDefinition'
import UrlGenerator, { urlGeneratorOptions } from './UrlGenerator'
import MethodNotAllowedError from './errors/MethodNotAllowedError'

export interface routerConfiguration {
  urlGenerator?: urlGeneratorOptions
}

export default class Router {
  private _radixTrees: { [methodName: string]: RadixTrieRouter } = {}
  private readonly _urlGenerator: UrlGenerator = new UrlGenerator()

  constructor (options: routerConfiguration = {}) {
    if (options.urlGenerator != null) {
      this._urlGenerator = new UrlGenerator(options.urlGenerator)
    }
  }

  public get radixTrees (): { [methodName: string]: RadixTrieRouter } {
    return this._radixTrees
  }

  /**
   * Necessary if you want to use UrlGenerator
   */
  public addNamedRoute (name: string, route: RouteDefinition): void {
    this.addRoute(route)

    this._urlGenerator.addRoute(name, route)
  }

  public addRoute (route: RouteDefinition): void {
    if (typeof route.methods === 'string') {
      route.methods = [route.methods]
    }

    route.methods.forEach((method: string) => {
      this.addMethod(method)
      this._radixTrees[method].addRouteNode(route)
    })
  }

  public match ({ path, method }: RequestContext): TreeNode {
    if (!(method in this._radixTrees)) {
      throw new MethodNotAllowedError(method)
    }

    return this._radixTrees[method].find(path)
  }

  public generateUrl (name: string, parameters: { [paramName: string]: string | number } = {}, options: urlGeneratorOptions = {}): string {
    return this._urlGenerator.generate(name, parameters, options)
  }

  public addMethod (method: string): void {
    if (!(method in this._radixTrees)) {
      this._radixTrees[method] = new RadixTrieRouter()
    }
  }
}

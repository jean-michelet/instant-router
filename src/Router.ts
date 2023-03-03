import RadixTrieRouter from './RadixTreeRouter'
import RequestContext from './RequestContext'
import { RouteDefinition } from './RouteDefinition'
import MethodNotAllowedError from './errors/MethodNotAllowedError'

export default class Router {
  private _radixTrees: { [methodName: string]: RadixTrieRouter } = {}

  public addRoute (route: RouteDefinition) {
    if (typeof route.methods === 'string') {
      route.methods = [route.methods]
    }

    route.methods.forEach((method: string) => {
      this.addMethod(method)
      this._radixTrees[method].addRouteNode(route)
    })
  }

  public get radixTrees(): { [methodName: string]: RadixTrieRouter } {
    return this._radixTrees
  }

  public match ({ path, method }: RequestContext) {
    if (!(method in this._radixTrees)) {
      throw new MethodNotAllowedError(method)
    }

    return this._radixTrees[method].find(path)
  }

  public addMethod (method: string): void {
    if (!(method in this._radixTrees)) {
      this._radixTrees[method] = new RadixTrieRouter()
    }
  }
}

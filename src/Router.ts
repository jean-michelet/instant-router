import RadixTrieRouter from './RadixTrieRouter'
import RequestContext from './RequestContext'
import { RouteDefinition } from './RouteDefinition'
import MethodNotAllowedError from './errors/MethodNotAllowedError'

export default class Router {
  private _radixTries: { [methodName: string]: RadixTrieRouter } = {}

  public addRoute (route: RouteDefinition) {
    if (typeof route.methods === 'string') {
      route.methods = [route.methods]
    }

    route.methods.forEach((method: string) => {
      this.addMethod(method)
      this._radixTries[method].addRouteNode(route)
    })
  }

  public match ({ path, method }: RequestContext) {
    if (!(method in this._radixTries)) {
      throw new MethodNotAllowedError(method)
    }

    return this._radixTries[method].find(path)
  }

  public addMethod (method: string): void {
    if (!(method in this._radixTries)) {
      this._radixTries[method] = new RadixTrieRouter()
    }
  }
}

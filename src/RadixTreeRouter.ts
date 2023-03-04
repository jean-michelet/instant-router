import { IncomingMessage, ServerResponse } from 'http'
import RouteDefinition from './RouteDefinition'
import ResourceNotFound from './errors/ResourceNotFound'

export interface TreeNode {
  name: string
  fullName: string
  isPath: boolean
  isParam: boolean
  children: TreeNode[]
  params?: { [paramName: string]: string }
  regex?: RegExp
  controller?: ((req: IncomingMessage, res: ServerResponse) => void)
}

export const TREE_NODE_DEFAULT_REGEX = /^[^/]+$/

export default class RadixTreeRouter {
  private readonly _root: TreeNode = { name: '/', fullName: '', isPath: false, isParam: false, children: [] }
  private _staticRoutes: { [paramName: string]: TreeNode } = {}

  get root (): TreeNode {
    return this._root
  }

  find (path: string): TreeNode {
    const staticRoute = this._getStaticRoutes(path)
    if (staticRoute !== null) {
      return staticRoute
    }

    let currentNode: TreeNode = this._root

    const parts = path.split('/')

    const params: { [paramName: string]: string } = {}

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i]
      let childNode: TreeNode | null = null

      for (const node of currentNode.children) {
        if (node.isParam) {
          if (node.regex !== undefined && !node.regex.test(part)) {
            continue
          }

          params[node.name.slice(1)] = part
          childNode = node
          break
        } else if (node.name === part) {
          childNode = node
          break
        }
      }

      if (childNode === null) {
        throw new ResourceNotFound(`Could not match node with part '${part}'`)
      }

      currentNode = childNode
    }

    if (!currentNode.isPath) {
      throw new ResourceNotFound(`No path exists for string '${path}'`)
    }

    currentNode.params = params
    return currentNode
  }

  addRouteNode (route: RouteDefinition): void {
    const path = route.path

    let currentNode: TreeNode = this._root
    const parts = path.split('/')
    let isStaticRoute = true
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i]
      let childNode: TreeNode | undefined
      const fullName = `${currentNode.fullName}/${part}`
      for (const node of currentNode.children) {
        if (node.fullName === fullName) {
          childNode = node
          break
        }

        if (node.isParam) {
          isStaticRoute = false
          if (node.name.slice(1) === part) {
            childNode = node
            break
          }
        } else if (node.name === part) {
          childNode = node
          break
        }
      }

      if (childNode == null) {
        const isParam = part.startsWith(':')
        childNode = { name: part, fullName, isPath: false, isParam, children: [] }
        if (isParam) {
          isStaticRoute = false
          let regex = TREE_NODE_DEFAULT_REGEX
          if (route.requirements !== undefined && route.requirements[part.slice(1)] !== undefined) {
            regex = new RegExp(`^${route.requirements[part.slice(1)]}$`)
          }

          childNode.regex = regex
        }

        currentNode.children.push(childNode)
      }

      currentNode = childNode
    }

    if (isStaticRoute) {
      this._staticRoutes[path] = currentNode
    }

    currentNode.controller = route.controller
    currentNode.isPath = true
  }

  private _getStaticRoutes (name: string): TreeNode | null {
    return this._staticRoutes[name] ?? null
  }
}

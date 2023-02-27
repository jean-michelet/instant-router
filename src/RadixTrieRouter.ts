import { IncomingMessage, ServerResponse } from 'http'
import { RouteDefinition } from './RouteDefinition'
import ResourceNotFound from './errors/ResourceNotFound'

export interface TrieNode {
  name: string
  fullName: string
  isPath: boolean
  isParam: boolean
  children: TrieNode[]
  cachedChildren: { [paramName: string]: TrieNode }
  params?: { [paramName: string]: string }
  regex?: RegExp
  controller?: ((req: IncomingMessage, res: ServerResponse) => void)
}

export const TRIE_NODE_DEFAULT_REGEX = /^[^\/]+$/

export default class RadixTrieRouter {
  private readonly _root: TrieNode = { name: '/', fullName: '', isPath: false, isParam: false, children: [], cachedChildren: {} }

  get root (): TrieNode {
    return this._root
  }

  find (path: string): TrieNode {
    let currentNode: TrieNode = this._root
    const params: { [paramName: string]: string } = {}

    const parts = path.split('/')
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i]
      let childNode: TrieNode | undefined = currentNode.cachedChildren[part] || null

      if (childNode) {
        currentNode = childNode
      } else {
        for (const node of currentNode.children) {
          if (node.isParam) {
            if ((node.regex != null) && !node.regex.test(part)) {
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
  
        if (childNode == null) {
          throw new ResourceNotFound(`Could not match node with part '${part}'`)
        }
  
        currentNode.cachedChildren[part] = childNode
        currentNode = childNode
      }
    }

    if (!currentNode.isPath) {
      throw new ResourceNotFound(`No path exists for string '${path}'`)
    }

    currentNode.params = params
    return currentNode
  }

  addRouteNode (route: RouteDefinition) {
    const path = route.path

    let currentNode: TrieNode = this._root
    const parts = path.split('/')
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i]
      let childNode: TrieNode | undefined
      const fullName = `${currentNode.fullName}/${part}`
      for (const node of currentNode.children) {
        if (node.fullName === fullName) {
          childNode = node
          break
        }

        if (node.isParam) {
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
        childNode = { name: part, fullName, isPath: false, isParam, children: [], cachedChildren: {} }
        if (isParam) {
          let regex = TRIE_NODE_DEFAULT_REGEX
          if (route.requirements != null && route.requirements[part.slice(1)]) {
            regex = new RegExp(`^${route.requirements[part.slice(1)]}$`)
          }

          childNode.regex = regex
        }

        currentNode.children.push(childNode)
      }

      currentNode = childNode
    }

    currentNode.controller = route.controller
    currentNode.isPath = true
  }
}

import { IncomingMessage, ServerResponse } from 'http'

export interface RouteDefinition {
  path: string
  methods: string | string[]
  controller: ControllerFunction
  requirements?: { [paramName: string]: string }
}

export type ControllerFunction = ((req: IncomingMessage, res: ServerResponse) => void)

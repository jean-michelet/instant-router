export interface RouteDefinition {
  path: string
  methods: string | string[]
  controller: ((req: any, res: any) => void)
  requirements?: { [paramName: string]: string }
}

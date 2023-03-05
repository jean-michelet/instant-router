export default class MissingParameterError extends Error {
  constructor (paramName: string) {
    super(`Missing parameter "${paramName}"`)
    this.name = 'MissingParameterError'
  }
}

export default class MethodNotAllowedError extends Error {
  constructor (method: string, message: string = `Method "${method}" is not allowed.`) {
    super(message)

    this.name = 'MethodNotAllowedError'
  }
}

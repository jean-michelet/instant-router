import RequestContext from '../RequestContext'

export default class MethodNotAllowedError extends Error {
  constructor (method: string) {
    const message = `Invalid HTTP method '${method}'. The '${method}' method is not allowed by the RequestContext class.\n` +
                    `Use a valid HTTP method: ${RequestContext.availableHttpMethods.join(', ')}.\n` +
                    'To add a custom HTTP method, update the \'availableHttpMethods\' static array in the RequestContext class.'

    super(message)
    this.name = 'MethodNotAllowedError'
  }
}

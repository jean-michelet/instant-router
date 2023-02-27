import RequestContext from '../../RequestContext'
import MethodNotAllowedError from '../../errors/MethodNotAllowedError'

describe('MethodNotAllowedError', () => {
  test('should have correct message', () => {
    const method = 'PATCH'
    const error = new MethodNotAllowedError(method)
    const expectedMessage = `Invalid HTTP method '${method}'. The '${method}' method is not allowed by the RequestContext class.\n` +
                             `Use a valid HTTP method: ${RequestContext.availableHttpMethods.join(', ')}.\n` +
                             'To add a custom HTTP method, update the \'availableHttpMethods\' static array in the RequestContext class.'

    expect(error.message).toBe(expectedMessage)
  })

  test('should have correct name', () => {
    const method = 'PATCH'
    const error = new MethodNotAllowedError(method)

    expect(error.name).toBe('MethodNotAllowedError')
  })
})

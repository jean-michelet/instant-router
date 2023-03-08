import MethodNotAllowedError from '../../errors/MethodNotAllowedError'

describe('MethodNotAllowedError', () => {
  test('should have correct message', () => {
    const method = 'PATCH'
    const error = new MethodNotAllowedError(method)

    expect(error.message).toBe('Method "PATCH" is not allowed.')
  })

  test('should have correct name', () => {
    const method = 'PATCH'
    const error = new MethodNotAllowedError(method)

    expect(error.name).toBe('MethodNotAllowedError')
  })
})

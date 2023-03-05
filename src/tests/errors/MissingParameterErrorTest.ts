import MissingParameterError from "../../errors/MissingParameterError"

describe('MissingParameterError', () => {
  it('should create a correct error message', () => {
    const paramName = 'userId'
    const error = new MissingParameterError(paramName)

    expect(error.message).toBe(`Missing parameter "${paramName}"`)
  })

  it('should have the correct name', () => {
    const error = new MissingParameterError('userId')

    expect(error.name).toBe('MissingParameterError')
  })
})

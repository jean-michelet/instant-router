import MissingAbsoluteUrlGeneratorOption from '../../errors/MissingAbsoluteUrlGeneratorOption'

describe('MissingAbsoluteUrlGeneratorOption', () => {
  it('should create an instance with the correct message', () => {
    const option = 'scheme'
    const error = new MissingAbsoluteUrlGeneratorOption(option)

    expect(error.message).toBe(`Option "${option}" is missing to generate absolute url`)
    expect(error.name).toBe('MissingAbsoluteUrlGeneratorOption')
  })
})

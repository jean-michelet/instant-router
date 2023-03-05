export default class MissingAbsoluteUrlGeneratorOption extends Error {
  constructor (option: string) {
    const message = `Option "${option}" is missing to generate absolute url`

    super(message)
    this.name = 'MissingAbsoluteUrlGeneratorOption'
  }
}

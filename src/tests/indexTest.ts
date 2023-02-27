import {
  RadixTrieRouter,
  RequestContext,
  Router,
  MethodNotAllowedError,
  ResourceNotFound
} from '../index'

describe('Index', () => {
  it('exports RadixTrieRouter', () => {
    expect(RadixTrieRouter).toBeInstanceOf(Function)
  })

  it('exports RequestContext', () => {
    expect(RequestContext).toBeInstanceOf(Function)
  })

  it('exports Router as the default export', () => {
    expect(Router).toBeInstanceOf(Function)
  })

  it('exports MethodNotAllowedError', () => {
    expect(MethodNotAllowedError).toBeInstanceOf(Function)
  })

  it('exports ResourceNotFound', () => {
    expect(ResourceNotFound).toBeInstanceOf(Function)
  })
})

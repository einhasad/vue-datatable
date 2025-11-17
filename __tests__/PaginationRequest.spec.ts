import { describe, it, expect } from 'vitest'
import { PaginationRequest } from '../src/types'

describe('PaginationRequest', () => {
  it('should create with default values', () => {
    const request = new PaginationRequest()

    expect(request.next).toBe('')
    expect(request.limit).toBe(20)
    expect(request.nextParamName).toBe('page')
    expect(request.limitParamName).toBe('pageSize')
  })

  it('should create with custom values', () => {
    const request = new PaginationRequest({
      next: 'cursor-abc',
      limit: 50,
      nextParamName: 'cursor',
      limitParamName: 'limit'
    })

    expect(request.next).toBe('cursor-abc')
    expect(request.limit).toBe(50)
    expect(request.nextParamName).toBe('cursor')
    expect(request.limitParamName).toBe('limit')
  })

  it('should allow partial configuration', () => {
    const request = new PaginationRequest({
      limit: 100
    })

    expect(request.next).toBe('')
    expect(request.limit).toBe(100)
    expect(request.nextParamName).toBe('page')
    expect(request.limitParamName).toBe('pageSize')
  })

  it('should override only specified values', () => {
    const request = new PaginationRequest({
      nextParamName: 'offset'
    })

    expect(request.next).toBe('')
    expect(request.limit).toBe(20)
    expect(request.nextParamName).toBe('offset')
    expect(request.limitParamName).toBe('pageSize')
  })

  it('should handle all custom parameter names', () => {
    const request = new PaginationRequest({
      nextParamName: 'after',
      limitParamName: 'count'
    })

    expect(request.nextParamName).toBe('after')
    expect(request.limitParamName).toBe('count')
  })

  it('should accept zero as limit', () => {
    const request = new PaginationRequest({
      limit: 0
    })

    expect(request.limit).toBe(0)
  })

  it('should accept negative limit (for unlimited scenarios)', () => {
    const request = new PaginationRequest({
      limit: -1
    })

    expect(request.limit).toBe(-1)
  })

  it('should be mutable after creation', () => {
    const request = new PaginationRequest()

    request.next = 'new-cursor'
    request.limit = 30
    request.nextParamName = 'token'
    request.limitParamName = 'size'

    expect(request.next).toBe('new-cursor')
    expect(request.limit).toBe(30)
    expect(request.nextParamName).toBe('token')
    expect(request.limitParamName).toBe('size')
  })
})

import { describe, it, expect, beforeEach } from 'vitest'
import { isCursorPagination, isPagePagination, DefaultResponseAdapter } from '../types'
import type { CursorPaginationData, PagePaginationData } from '../types'

describe('Type Guards', () => {
  describe('isCursorPagination', () => {
    it('should return true for cursor pagination data', () => {
      const cursorData: CursorPaginationData = {
        nextCursor: 'abc123',
        hasMore: true
      }
      expect(isCursorPagination(cursorData)).toBe(true)
    })

    it('should return false for page pagination data', () => {
      const pageData: PagePaginationData = {
        currentPage: 1,
        pageCount: 10,
        perPage: 20,
        totalCount: 200
      }
      expect(isCursorPagination(pageData as any)).toBe(false)
    })
  })

  describe('isPagePagination', () => {
    it('should return true for page pagination data', () => {
      const pageData: PagePaginationData = {
        currentPage: 1,
        pageCount: 10,
        perPage: 20,
        totalCount: 200
      }
      expect(isPagePagination(pageData)).toBe(true)
    })

    it('should return false for cursor pagination data', () => {
      const cursorData: CursorPaginationData = {
        nextCursor: 'abc123',
        hasMore: true
      }
      expect(isPagePagination(cursorData as any)).toBe(false)
    })
  })
})

describe('DefaultResponseAdapter', () => {
  let adapter: DefaultResponseAdapter

  beforeEach(() => {
    adapter = new DefaultResponseAdapter()
  })

  describe('extractItems', () => {
    it('should extract items from response.items', () => {
      const response = {
        items: [{ id: 1 }, { id: 2 }]
      }
      expect(adapter.extractItems(response)).toEqual([{ id: 1 }, { id: 2 }])
    })

    it('should extract items from response.data', () => {
      const response = {
        data: [{ id: 1 }, { id: 2 }]
      }
      expect(adapter.extractItems(response)).toEqual([{ id: 1 }, { id: 2 }])
    })

    it('should return empty array if no items or data', () => {
      const response = {}
      expect(adapter.extractItems(response)).toEqual([])
    })
  })

  describe('extractPagination', () => {
    it('should extract cursor pagination data', () => {
      const response = {
        items: [],
        nextCursor: 'abc123',
        hasMore: true
      }
      const pagination = adapter.extractPagination(response)
      expect(pagination).toEqual({
        nextCursor: 'abc123',
        hasMore: true
      })
    })

    it('should extract page pagination data', () => {
      const response = {
        items: [],
        pagination: {
          currentPage: 2,
          pageCount: 10,
          perPage: 20,
          totalCount: 200
        }
      }
      const pagination = adapter.extractPagination(response)
      expect(pagination).toEqual({
        currentPage: 2,
        pageCount: 10,
        perPage: 20,
        totalCount: 200
      })
    })

    it('should return undefined if no pagination data', () => {
      const response = {
        items: []
      }
      expect(adapter.extractPagination(response)).toBeUndefined()
    })

    it('should handle hasMore defaulting to false', () => {
      const response = {
        items: [],
        nextCursor: 'abc123'
      }
      const pagination = adapter.extractPagination(response)
      expect(pagination).toEqual({
        nextCursor: 'abc123',
        hasMore: false
      })
    })
  })
})

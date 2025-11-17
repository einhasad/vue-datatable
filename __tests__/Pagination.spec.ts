import { describe, it, expect } from 'vitest'
import { HttpPagination } from '../src/providers/HttpPagination'
import { ArrayPagination } from '../src/providers/ArrayPagination'
import { ElasticPagination } from '../src/providers/ElasticPagination'
import type { CursorPaginationData, PagePaginationData } from '../src/types'

describe('Pagination Classes', () => {
  describe('HttpPagination', () => {
    describe('with cursor-based pagination', () => {
      const cursorData: CursorPaginationData = {
        nextCursor: 'cursor-123',
        hasMore: true
      }

      it('should return null for page-based methods', () => {
        const pagination = new HttpPagination(cursorData)

        expect(pagination.getTotalCount()).toBeNull()
        expect(pagination.getPageCount()).toBeNull()
        expect(pagination.getCurrentPage()).toBeNull()
        expect(pagination.getPageSize()).toBeNull()
      })

      it('should return cursor data', () => {
        const pagination = new HttpPagination(cursorData)

        expect(pagination.getNextToken()).toBe('cursor-123')
        expect(pagination.hasMore()).toBe(true)
      })

      it('should handle empty cursor', () => {
        const emptyData: CursorPaginationData = {
          nextCursor: '',
          hasMore: false
        }
        const pagination = new HttpPagination(emptyData)

        expect(pagination.getNextToken()).toBeNull()
        expect(pagination.hasMore()).toBe(false)
      })
    })

    describe('with page-based pagination', () => {
      const pageData: PagePaginationData = {
        currentPage: 3,
        pageCount: 10,
        perPage: 20,
        totalCount: 200
      }

      it('should return page data', () => {
        const pagination = new HttpPagination(pageData)

        expect(pagination.getCurrentPage()).toBe(3)
        expect(pagination.getPageCount()).toBe(10)
        expect(pagination.getPageSize()).toBe(20)
        expect(pagination.getTotalCount()).toBe(200)
      })

      it('should return null for cursor methods', () => {
        const pagination = new HttpPagination(pageData)

        expect(pagination.getNextToken()).toBeNull()
      })

      it('should calculate hasMore correctly', () => {
        const pagination = new HttpPagination(pageData)
        expect(pagination.hasMore()).toBe(true)

        const lastPageData: PagePaginationData = {
          currentPage: 10,
          pageCount: 10,
          perPage: 20,
          totalCount: 200
        }
        const lastPagePagination = new HttpPagination(lastPageData)
        expect(lastPagePagination.hasMore()).toBe(false)
      })
    })

    describe('with null data', () => {
      it('should return null/false for all methods', () => {
        const pagination = new HttpPagination(null)

        expect(pagination.getTotalCount()).toBeNull()
        expect(pagination.getPageCount()).toBeNull()
        expect(pagination.getCurrentPage()).toBeNull()
        expect(pagination.getPageSize()).toBeNull()
        expect(pagination.getNextToken()).toBeNull()
        expect(pagination.hasMore()).toBe(false)
      })
    })
  })

  describe('ArrayPagination', () => {
    describe('with cursor-based pagination', () => {
      const cursorData: CursorPaginationData = {
        nextCursor: '50',
        hasMore: true
      }

      it('should return cursor data', () => {
        const pagination = new ArrayPagination(cursorData)

        expect(pagination.getNextToken()).toBe('50')
        expect(pagination.hasMore()).toBe(true)
      })

      it('should return null for page-based methods', () => {
        const pagination = new ArrayPagination(cursorData)

        expect(pagination.getTotalCount()).toBeNull()
        expect(pagination.getPageCount()).toBeNull()
        expect(pagination.getCurrentPage()).toBeNull()
        expect(pagination.getPageSize()).toBeNull()
      })
    })

    describe('with page-based pagination', () => {
      const pageData: PagePaginationData = {
        currentPage: 2,
        pageCount: 5,
        perPage: 10,
        totalCount: 47
      }

      it('should return page data', () => {
        const pagination = new ArrayPagination(pageData)

        expect(pagination.getCurrentPage()).toBe(2)
        expect(pagination.getPageCount()).toBe(5)
        expect(pagination.getPageSize()).toBe(10)
        expect(pagination.getTotalCount()).toBe(47)
      })

      it('should calculate hasMore correctly', () => {
        const pagination = new ArrayPagination(pageData)
        expect(pagination.hasMore()).toBe(true)
      })
    })

    describe('with null data', () => {
      it('should return null/false for all methods', () => {
        const pagination = new ArrayPagination(null)

        expect(pagination.getTotalCount()).toBeNull()
        expect(pagination.getPageCount()).toBeNull()
        expect(pagination.getCurrentPage()).toBeNull()
        expect(pagination.getPageSize()).toBeNull()
        expect(pagination.getNextToken()).toBeNull()
        expect(pagination.hasMore()).toBe(false)
      })
    })
  })

  describe('ElasticPagination', () => {
    const cursorData: CursorPaginationData = {
      nextCursor: 'elastic-cursor',
      hasMore: true
    }

    it('should return total hits count', () => {
      const pagination = new ElasticPagination(cursorData, 1250)

      expect(pagination.getTotalCount()).toBe(1250)
    })

    it('should return cursor data', () => {
      const pagination = new ElasticPagination(cursorData, 1250)

      expect(pagination.getNextToken()).toBe('elastic-cursor')
      expect(pagination.hasMore()).toBe(true)
    })

    it('should return null for page-based methods', () => {
      const pagination = new ElasticPagination(cursorData, 1250)

      expect(pagination.getPageCount()).toBeNull()
      expect(pagination.getCurrentPage()).toBeNull()
      expect(pagination.getPageSize()).toBeNull()
    })

    it('should handle zero total hits', () => {
      const pagination = new ElasticPagination(cursorData, 0)

      expect(pagination.getTotalCount()).toBe(0)
    })

    it('should handle null data', () => {
      const pagination = new ElasticPagination(null, 100)

      expect(pagination.getTotalCount()).toBe(100)
      expect(pagination.getNextToken()).toBeNull()
      expect(pagination.hasMore()).toBe(false)
    })

    it('should handle empty cursor', () => {
      const emptyData: CursorPaginationData = {
        nextCursor: '',
        hasMore: false
      }
      const pagination = new ElasticPagination(emptyData, 50)

      expect(pagination.getNextToken()).toBeNull()
      expect(pagination.hasMore()).toBe(false)
      expect(pagination.getTotalCount()).toBe(50)
    })
  })
})

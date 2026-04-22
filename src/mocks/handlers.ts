/**
 * MSW Handlers for Mock GitHub API
 * 
 * This file defines request handlers that intercept API calls
 * and return mock data. Works in both browser and Node.js environments.
 */

import { http, HttpResponse } from 'msw'
import { generateMockRepositories } from './data'
import { processSearchRequest } from './search'

const repositories = generateMockRepositories()

export const handlers = [
  // Health check endpoint
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'ok',
      message: 'Mock API is running',
      totalRepositories: repositories.length
    })
  }),

  // Search repositories endpoint
  http.get('/api/search/repositories', ({ request }: { request: Request }) => {
    const url = new URL(request.url)
    const params = {
      q: url.searchParams.get('q') || '',
      sort: url.searchParams.get('sort') || 'stars',
      order: url.searchParams.get('order') || 'desc',
      page: url.searchParams.get('page') || '1',
      per_page: url.searchParams.get('per_page') || '30'
    }

    const result = processSearchRequest(repositories, params)
    return HttpResponse.json(result)
  })
]

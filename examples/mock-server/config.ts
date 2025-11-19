/**
 * Mock GitHub API Configuration
 *
 * This module provides configuration for using either the real GitHub API
 * or the mock API based on environment variables.
 */

export interface GitHubApiConfig {
  baseUrl: string
  useMock: boolean
}

/**
 * Get the GitHub API configuration
 *
 * In development/testing, you can use the mock API by setting:
 * - VITE_USE_MOCK_GITHUB_API=true
 * - VITE_MOCK_GITHUB_API_URL=http://localhost:3001
 */
export function getGitHubApiConfig(): GitHubApiConfig {
  const useMock = import.meta.env?.VITE_USE_MOCK_GITHUB_API === 'true' ||
                  process.env.VITE_USE_MOCK_GITHUB_API === 'true' ||
                  process.env.NODE_ENV === 'test'

  const mockUrl = import.meta.env?.VITE_MOCK_GITHUB_API_URL ||
                  process.env.VITE_MOCK_GITHUB_API_URL ||
                  'http://localhost:3001'

  return {
    baseUrl: useMock ? `${mockUrl}/api/github` : 'https://api.github.com',
    useMock
  }
}

/**
 * Get the search repositories endpoint URL
 */
export function getSearchRepositoriesUrl(): string {
  const config = getGitHubApiConfig()
  return `${config.baseUrl}/search/repositories`
}

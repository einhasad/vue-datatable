// Custom adapter for mock API response format
class GitHubSearchAdapter {
  private currentPage = 1

  setCurrentPage(page: number) {
    this.currentPage = page
  }

  extractItems(response: any): any[] {
    return response.items || []
  }

  extractPagination(response: any) {
    const totalCount = response.total_count || 0
    return {
      currentPage: this.currentPage,
      perPage: 10,
      pageCount: Math.min(Math.ceil(totalCount / 10), 100),
      totalCount: Math.min(totalCount, 1000)
    }
  }

  isSuccess(response: any): boolean {
    return !response.message
  }

  getErrorMessage(response: any): string {
    return response.message || 'API request failed'
  }
}

const adapter = new GitHubSearchAdapter()

async function githubHttpClient(fullUrl: string): Promise<any> {
  const urlObj = new URL(fullUrl)
  const q = urlObj.searchParams.get('gh-q') || 'vue table'
  const sort = urlObj.searchParams.get('gh-sort') || 'stars'
  const page = urlObj.searchParams.get('page') || '1'

  adapter.setCurrentPage(parseInt(page))

  const params = new URLSearchParams({
    q, sort, order: 'desc', per_page: '10', page
  })

  const response = await fetch(`https://api.github.com/search/repositories?${params}`)
  return response.json()
}

const provider = new HttpDataProvider({
  url: 'https://api.github.com/search/repositories',
  pagination: true,
  paginationMode: 'page',
  pageSize: 10,
  responseAdapter: adapter,
  httpClient: githubHttpClient,
  stateProvider: new QueryParamsStateProvider({
    router,
    prefix: 'gh'
  })
})

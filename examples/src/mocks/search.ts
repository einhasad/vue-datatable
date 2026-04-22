/**
 * Mock GitHub Search Logic
 * Implements search, filtering, sorting, and pagination for mock repositories
 */

export function searchRepositories(repositories: any[], query: string) {
  if (!query || query.trim() === '') {
    return repositories
  }

  const searchTerm = query.toLowerCase().trim()
  const terms = searchTerm.split(/\s+/)

  return repositories.filter(repo => {
    const searchableText = [
      repo.name,
      repo.owner.login,
      repo.full_name,
      repo.description || '',
      repo.language || '',
      ...(repo.topics || [])
    ].join(' ').toLowerCase()

    return terms.every(term => searchableText.includes(term))
  })
}

export function sortRepositories(repositories: any[], sortBy: string, order = 'desc') {
  const sorted = [...repositories]

  const compareFn = (a: any, b: any) => {
    let aValue: number, bValue: number

    switch (sortBy) {
      case 'stars':
        aValue = a.stargazers_count
        bValue = b.stargazers_count
        break
      case 'forks':
        aValue = a.forks_count
        bValue = b.forks_count
        break
      case 'updated':
        aValue = new Date(a.updated_at).getTime()
        bValue = new Date(b.updated_at).getTime()
        break
      case 'help-wanted-issues':
        aValue = a.open_issues_count
        bValue = b.open_issues_count
        break
      default:
        aValue = a.stargazers_count
        bValue = b.stargazers_count
    }

    if (order === 'asc') {
      return aValue - bValue
    } else {
      return bValue - aValue
    }
  }

  return sorted.sort(compareFn)
}

export function paginateResults(repositories: any[], page = 1, perPage = 30) {
  const pageNum = Math.max(1, parseInt(String(page), 10))
  const itemsPerPage = Math.min(100, Math.max(1, parseInt(String(perPage), 10)))

  const startIndex = (pageNum - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  return {
    items: repositories.slice(startIndex, endIndex),
    total: repositories.length,
    page: pageNum,
    perPage: itemsPerPage
  }
}

export function processSearchRequest(allRepositories: any[], params: any) {
  const {
    q = '',
    sort = 'stars',
    order = 'desc',
    page = 1,
    per_page = 30
  } = params

  let results = searchRepositories(allRepositories, q)
  results = sortRepositories(results, sort, order)
  const paginated = paginateResults(results, page, per_page)

  return {
    total_count: paginated.total,
    incomplete_results: false,
    items: paginated.items
  }
}
